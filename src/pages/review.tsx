import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ReviewFormData, ReviewUrlParams } from '@/types/review';
import { reviewService } from '@/lib/reviewService';

// Star Rating Component
const StarRating = ({ 
  rating, 
  onRatingChange, 
  label, 
  required = true 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void; 
  label: string;
  required?: boolean;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl transition-colors ${
              star <= (hoverRating || rating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            } hover:text-yellow-400`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => onRatingChange(star)}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating}/5` : 'Click to rate'}
        </span>
      </div>
    </div>
  );
};

export default function ReviewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlParams, setUrlParams] = useState<ReviewUrlParams>({});

  // Form state
  const [formData, setFormData] = useState<Partial<ReviewFormData>>({
    customerName: '',
    customerEmail: '',
    paymentId: '',
    lessonDate: '',
    beach: '',
    instructorName: '',
    overallRating: 5,
    instructorRating: 5,
    equipmentRating: 5,
    experienceRating: 5,
    reviewTitle: '',
    reviewText: '',
    wouldRecommend: true,
    favoriteAspect: '',
    improvementSuggestions: '',
  });

  // Parse URL parameters on mount
  useEffect(() => {
    if (router.isReady) {
      const searchParams = new URLSearchParams(window.location.search);
      const params = reviewService.parseUrlParams(searchParams);
      setUrlParams(params);
      
      // Pre-fill form with URL parameters
      setFormData(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== undefined)
        ),
      }));
    }
  }, [router.isReady]);

  const handleInputChange = (field: keyof ReviewFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = {
        customerName: 'Customer name',
        customerEmail: 'Email address',
        paymentId: 'Payment ID',
        reviewTitle: 'Review title',
        reviewText: 'Review text',
        overallRating: 'Overall rating',
        instructorRating: 'Instructor rating',
        equipmentRating: 'Equipment rating',
        experienceRating: 'Experience rating',
      };

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field as keyof ReviewFormData]) {
          setError(`${label} is required`);
          setIsLoading(false);
          return;
        }
      }

      // Submit review
      const result = await reviewService.submitReview({
        ...formData,
        submittedAt: new Date().toISOString(),
      } as ReviewFormData);

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || 'Failed to submit review');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Head>
          <title>Review Submitted - Zek's Surf School</title>
          <meta name="description" content="Thank you for your review!" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🏄‍♂️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Thank You for Your Review!
            </h1>
            <p className="text-gray-600 mb-6">
              Your feedback has been submitted successfully. We appreciate you taking the time to share your experience with us!
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Share Your Experience - Zek's Surf School</title>
        <meta name="description" content="Tell us about your surf lesson experience" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏄‍♂️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              How Was Your Surf Lesson?
            </h1>
            <p className="text-gray-600">
                              We'd love to hear about your experience on the water with Zek's Surf School!
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerName || ''}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail || ''}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Lesson Details - Only show if not pre-filled via URL */}
              {(!urlParams.paymentId) && (
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Lesson Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.paymentId || ''}
                        onChange={(e) => handleInputChange('paymentId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Payment reference number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson Date
                      </label>
                      <input
                        type="date"
                        value={formData.lessonDate || ''}
                        onChange={(e) => handleInputChange('lessonDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Beach Location
                      </label>
                      <select
                        value={formData.beach || ''}
                        onChange={(e) => handleInputChange('beach', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select beach</option>
                        <option value="Doheny">Doheny State Beach</option>
                        <option value="T-Street">T-Street Beach</option>
                        <option value="San Onofre">San Onofre State Beach</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructor Name
                      </label>
                      <input
                        type="text"
                        value={formData.instructorName || ''}
                        onChange={(e) => handleInputChange('instructorName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your instructor's name"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Lesson Details Summary - Show when pre-filled */}
              {urlParams.paymentId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">📋 Reviewing Your Lesson</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-800">
                    {formData.lessonDate && (
                      <div><strong>Date:</strong> {new Date(formData.lessonDate).toLocaleDateString()}</div>
                    )}
                    {formData.beach && (
                      <div><strong>Beach:</strong> {formData.beach}</div>
                    )}
                    {formData.instructorName && (
                      <div><strong>Instructor:</strong> {formData.instructorName}</div>
                    )}
                    <div><strong>Payment ID:</strong> {formData.paymentId}</div>
                  </div>
                </div>
              )}

              {/* Hidden inputs for pre-filled data */}
              {urlParams.paymentId && (
                <>
                  <input type="hidden" name="paymentId" value={formData.paymentId || ''} />
                  <input type="hidden" name="lessonDate" value={formData.lessonDate || ''} />
                  <input type="hidden" name="beach" value={formData.beach || ''} />
                  <input type="hidden" name="instructorName" value={formData.instructorName || ''} />
                </>
              )}

              {/* Ratings */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Experience</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StarRating
                    rating={formData.overallRating || 0}
                    onRatingChange={(rating) => handleInputChange('overallRating', rating)}
                    label="Overall Experience"
                  />
                  <StarRating
                    rating={formData.instructorRating || 0}
                    onRatingChange={(rating) => handleInputChange('instructorRating', rating)}
                    label="Instructor Quality"
                  />
                  <StarRating
                    rating={formData.equipmentRating || 0}
                    onRatingChange={(rating) => handleInputChange('equipmentRating', rating)}
                    label="Equipment Quality"
                  />
                  <StarRating
                    rating={formData.experienceRating || 0}
                    onRatingChange={(rating) => handleInputChange('experienceRating', rating)}
                    label="Learning Experience"
                  />
                </div>
              </div>

              {/* Written Review */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tell Us More</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.reviewTitle || ''}
                      onChange={(e) => handleInputChange('reviewTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Give your review a title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.reviewText || ''}
                      onChange={(e) => handleInputChange('reviewText', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Share your experience with future surfers..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Additional Questions */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">A Few More Questions</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Would you recommend Zek's Surf School to others?
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wouldRecommend"
                        checked={formData.wouldRecommend === true}
                        onChange={() => handleInputChange('wouldRecommend', true)}
                        className="mr-2"
                      />
                      Yes, absolutely!
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wouldRecommend"
                        checked={formData.wouldRecommend === false}
                        onChange={() => handleInputChange('wouldRecommend', false)}
                        className="mr-2"
                      />
                      Not really
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What was your favorite aspect of the lesson?
                  </label>
                  <input
                    type="text"
                    value={formData.favoriteAspect || ''}
                    onChange={(e) => handleInputChange('favoriteAspect', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What did you enjoy most?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Any suggestions for improvement? (Optional)
                  </label>
                  <textarea
                    value={formData.improvementSuggestions || ''}
                    onChange={(e) => handleInputChange('improvementSuggestions', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Help us improve our service..."
                  />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting Review...
                    </div>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Your review will be reviewed by our team before being published.</p>
                            <p className="mt-1">Thank you for choosing Zek's Surf School! 🏄‍♂️</p>
          </div>
        </div>
      </div>
    </>
  );
} 