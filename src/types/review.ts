export interface ReviewFormData {
  // Customer Information
  customerName: string;
  customerEmail: string;
  
  // Lesson Details
  paymentId: string;
  lessonDate: string;
  beach: string;
  instructorName?: string;
  
  // Review Content
  overallRating: number; // 1-5 stars
  instructorRating: number; // 1-5 stars
  equipmentRating: number; // 1-5 stars
  experienceRating: number; // 1-5 stars
  
  // Written Feedback
  reviewTitle: string;
  reviewText: string;
  
  // Specific Questions
  wouldRecommend: boolean;
  favoriteAspect: string;
  improvementSuggestions?: string;
  
  // Metadata
  submittedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ReviewSubmission extends ReviewFormData {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageOverallRating: number;
  averageInstructorRating: number;
  averageEquipmentRating: number;
  averageExperienceRating: number;
  recommendationPercentage: number;
  reviewsByRating: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  reviewsByBeach: Record<string, number>;
  recentReviews: ReviewSubmission[];
}

export interface ReviewUrlParams {
  paymentId?: string;
  customerName?: string;
  customerEmail?: string;
  lessonDate?: string;
  beach?: string;
  instructorName?: string;
} 