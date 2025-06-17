import { ReviewFormData, ReviewSubmission, ReviewStats, ReviewUrlParams } from '@/types/review';

class ReviewService {
  private readonly STORAGE_KEY = 'surf_school_reviews';
  private readonly STATS_CACHE_KEY = 'surf_school_review_stats';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Generate unique ID for reviews
  private generateId(): string {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get all reviews from localStorage
  private getStoredReviews(): ReviewSubmission[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading reviews from storage:', error);
      return [];
    }
  }

  // Save reviews to localStorage
  private saveReviews(reviews: ReviewSubmission[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reviews));
      // Clear stats cache when reviews change
      localStorage.removeItem(this.STATS_CACHE_KEY);
    } catch (error) {
      console.error('Error saving reviews to storage:', error);
      throw new Error('Failed to save review data');
    }
  }

  // Submit a new review
  async submitReview(formData: ReviewFormData): Promise<{ success: boolean; reviewId?: string; error?: string }> {
    try {
      // Validate required fields
      const requiredFields = ['customerName', 'customerEmail', 'paymentId', 'reviewTitle', 'reviewText'];
      for (const field of requiredFields) {
        if (!formData[field as keyof ReviewFormData]) {
          return { success: false, error: `${field} is required` };
        }
      }

      // Validate ratings
      const ratings = ['overallRating', 'instructorRating', 'equipmentRating', 'experienceRating'];
      for (const rating of ratings) {
        const value = formData[rating as keyof ReviewFormData] as number;
        if (!value || value < 1 || value > 5) {
          return { success: false, error: `${rating} must be between 1 and 5` };
        }
      }

      // Check for duplicate payment ID
      const existingReviews = this.getStoredReviews();
      const duplicateReview = existingReviews.find(review => review.paymentId === formData.paymentId);
      if (duplicateReview) {
        return { success: false, error: 'A review has already been submitted for this payment ID' };
      }

      // Create review submission
      const reviewSubmission: ReviewSubmission = {
        ...formData,
        id: this.generateId(),
        status: 'pending',
        submittedAt: new Date().toISOString(),
        ipAddress: await this.getClientIP(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      };

      // Save to storage
      const updatedReviews = [...existingReviews, reviewSubmission];
      this.saveReviews(updatedReviews);

      console.log('Review submitted successfully:', reviewSubmission.id);
      return { success: true, reviewId: reviewSubmission.id };

    } catch (error) {
      console.error('Error submitting review:', error);
      return { success: false, error: 'Failed to submit review. Please try again.' };
    }
  }

  // Get client IP address (best effort)
  private async getClientIP(): Promise<string | undefined> {
    try {
      // This is a simple approach - in production you might want to use a proper IP service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.log('Could not fetch IP address:', error);
      return undefined;
    }
  }

  // Get all reviews (admin function)
  getAllReviews(): ReviewSubmission[] {
    return this.getStoredReviews().sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  // Get reviews by status
  getReviewsByStatus(status: 'pending' | 'approved' | 'rejected'): ReviewSubmission[] {
    return this.getStoredReviews().filter(review => review.status === status);
  }

  // Get review by ID
  getReviewById(id: string): ReviewSubmission | null {
    const reviews = this.getStoredReviews();
    return reviews.find(review => review.id === id) || null;
  }

  // Update review status (admin function)
  updateReviewStatus(
    reviewId: string, 
    status: 'pending' | 'approved' | 'rejected',
    adminNotes?: string,
    approvedBy?: string
  ): boolean {
    try {
      const reviews = this.getStoredReviews();
      const reviewIndex = reviews.findIndex(review => review.id === reviewId);
      
      if (reviewIndex === -1) {
        return false;
      }

      reviews[reviewIndex] = {
        ...reviews[reviewIndex],
        status,
        adminNotes,
        approvedBy,
        approvedAt: status === 'approved' ? new Date().toISOString() : undefined,
      };

      this.saveReviews(reviews);
      return true;
    } catch (error) {
      console.error('Error updating review status:', error);
      return false;
    }
  }

  // Delete review (admin function)
  deleteReview(reviewId: string): boolean {
    try {
      const reviews = this.getStoredReviews();
      const filteredReviews = reviews.filter(review => review.id !== reviewId);
      
      if (filteredReviews.length === reviews.length) {
        return false; // Review not found
      }

      this.saveReviews(filteredReviews);
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  }

  // Get review statistics
  getReviewStats(): ReviewStats {
    try {
      // Check cache first
      const cached = localStorage.getItem(this.STATS_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < this.CACHE_DURATION) {
          return data;
        }
      }

      const reviews = this.getStoredReviews();
      const approvedReviews = reviews.filter(review => review.status === 'approved');

      if (approvedReviews.length === 0) {
        const emptyStats: ReviewStats = {
          totalReviews: 0,
          averageOverallRating: 0,
          averageInstructorRating: 0,
          averageEquipmentRating: 0,
          averageExperienceRating: 0,
          recommendationPercentage: 0,
          reviewsByRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          reviewsByBeach: {},
          recentReviews: [],
        };
        return emptyStats;
      }

      // Calculate averages
      const totalReviews = approvedReviews.length;
      const averageOverallRating = approvedReviews.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews;
      const averageInstructorRating = approvedReviews.reduce((sum, r) => sum + r.instructorRating, 0) / totalReviews;
      const averageEquipmentRating = approvedReviews.reduce((sum, r) => sum + r.equipmentRating, 0) / totalReviews;
      const averageExperienceRating = approvedReviews.reduce((sum, r) => sum + r.experienceRating, 0) / totalReviews;

      // Calculate recommendation percentage
      const recommendCount = approvedReviews.filter(r => r.wouldRecommend).length;
      const recommendationPercentage = (recommendCount / totalReviews) * 100;

      // Reviews by rating
      const reviewsByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      approvedReviews.forEach(review => {
        const rating = Math.round(review.overallRating) as 1 | 2 | 3 | 4 | 5;
        reviewsByRating[rating]++;
      });

      // Reviews by beach
      const reviewsByBeach: Record<string, number> = {};
      approvedReviews.forEach(review => {
        reviewsByBeach[review.beach] = (reviewsByBeach[review.beach] || 0) + 1;
      });

      // Recent reviews (last 10)
      const recentReviews = approvedReviews
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 10);

      const stats: ReviewStats = {
        totalReviews,
        averageOverallRating: Math.round(averageOverallRating * 10) / 10,
        averageInstructorRating: Math.round(averageInstructorRating * 10) / 10,
        averageEquipmentRating: Math.round(averageEquipmentRating * 10) / 10,
        averageExperienceRating: Math.round(averageExperienceRating * 10) / 10,
        recommendationPercentage: Math.round(recommendationPercentage * 10) / 10,
        reviewsByRating,
        reviewsByBeach,
        recentReviews,
      };

      // Cache the results
      localStorage.setItem(this.STATS_CACHE_KEY, JSON.stringify({
        data: stats,
        timestamp: Date.now(),
      }));

      return stats;
    } catch (error) {
      console.error('Error calculating review stats:', error);
      return {
        totalReviews: 0,
        averageOverallRating: 0,
        averageInstructorRating: 0,
        averageEquipmentRating: 0,
        averageExperienceRating: 0,
        recommendationPercentage: 0,
        reviewsByRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        reviewsByBeach: {},
        recentReviews: [],
      };
    }
  }

  // Parse URL parameters for pre-filling form
  parseUrlParams(searchParams: URLSearchParams): ReviewUrlParams {
    return {
      paymentId: searchParams.get('paymentId') || searchParams.get('payment_id') || undefined,
      customerName: searchParams.get('customerName') || searchParams.get('customer_name') || undefined,
      customerEmail: searchParams.get('customerEmail') || searchParams.get('customer_email') || undefined,
      lessonDate: searchParams.get('lessonDate') || searchParams.get('lesson_date') || undefined,
      beach: searchParams.get('beach') || undefined,
      instructorName: searchParams.get('instructorName') || searchParams.get('instructor_name') || undefined,
    };
  }

  // Export reviews data (admin function)
  exportReviews(): string {
    const reviews = this.getStoredReviews();
    const stats = this.getReviewStats();
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalReviews: reviews.length,
      reviews,
      statistics: stats,
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Clear all reviews (admin function - dangerous!)
  clearAllReviews(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STATS_CACHE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing reviews:', error);
      return false;
    }
  }
}

// Export singleton instance
export const reviewService = new ReviewService(); 