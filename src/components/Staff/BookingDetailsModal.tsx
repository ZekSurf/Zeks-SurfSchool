import React, { useState } from 'react';
import { CompletedBooking } from '@/types/booking';
import { supabaseStaffService } from '@/lib/supabaseStaffService';

interface BookingDetailsModalProps {
  booking: CompletedBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (bookingId: string, status: CompletedBooking['status']) => void;
}

export default function BookingDetailsModal({ 
  booking, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}: BookingDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !booking) return null;

  const handleStatusUpdate = async (newStatus: CompletedBooking['status']) => {
    setIsUpdating(true);
    try {
      const result = await supabaseStaffService.updateBookingStatus(booking.id, newStatus);
      if (result.success) {
        onStatusUpdate(booking.id, newStatus);
      } else {
        console.error('Error updating booking status:', result.error);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDateTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadgeClass = (status: CompletedBooking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl md:max-h-[90vh] max-h-[95vh] overflow-y-auto md:m-4 m-2">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl md:text-2xl p-2 md:p-0 -m-2 md:m-0"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Status */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-base md:text-lg font-semibold">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Confirmation: {booking.confirmationNumber}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
            <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-800">Customer Information</h3>
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              <div>
                <span className="font-medium text-gray-600">Name:</span>
                <div className="text-gray-800">{booking.customerName}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <div className="text-gray-800">
                  <a href={`mailto:${booking.customerEmail}`} className="text-blue-600 hover:underline">
                    {booking.customerEmail}
                  </a>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phone:</span>
                <div className="text-gray-800">
                  <a href={`tel:${booking.customerPhone}`} className="text-blue-600 hover:underline">
                    {booking.customerPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Information */}
          <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
            <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-800">Lesson Information</h3>
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              <div>
                <span className="font-medium text-gray-600">Beach:</span>
                <div className="text-gray-800">{booking.beach}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Date:</span>
                <div className="text-gray-800">
                  {new Date(booking.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Start Time:</span>
                <div className="text-gray-800">{formatTime(booking.startTime)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">End Time:</span>
                <div className="text-gray-800">{formatTime(booking.endTime)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Type:</span>
                <div className="text-gray-800">
                  {booking.isPrivate ? 'Private Lesson' : 'Group Lesson'}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Lessons Booked:</span>
                <div className="text-gray-800">{booking.lessonsBooked}</div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-green-50 p-3 md:p-4 rounded-lg">
            <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-800">Payment Information</h3>
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              <div>
                <span className="font-medium text-gray-600">Amount:</span>
                <div className="text-gray-800 text-lg font-semibold">
                  ${booking.price.toFixed(2)}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Payment ID:</span>
                <div className="text-gray-800 text-xs font-mono">
                  {booking.paymentIntentId}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Booking Time:</span>
                <div className="text-gray-800">
                  {formatDateTime(booking.timestamp)}
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Actions */}
          <div className="border-t pt-4">
            <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-800">Update Status</h3>
            <div className="flex flex-col md:flex-row gap-3 md:gap-2">
              {(['confirmed', 'completed', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdating || booking.status === status}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    booking.status === status
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : status === 'confirmed'
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : status === 'completed'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {isUpdating ? 'Updating...' : `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 