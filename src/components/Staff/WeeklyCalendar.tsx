import React, { useState, useEffect } from 'react';
import { CompletedBooking } from '@/types/booking';
import { supabaseStaffService } from '@/lib/supabaseStaffService';

interface WeeklyCalendarProps {
  selectedWeek: Date;
  onBookingClick: (booking: CompletedBooking) => void;
}

export default function WeeklyCalendar({ selectedWeek, onBookingClick }: WeeklyCalendarProps) {
  const [bookings, setBookings] = useState<CompletedBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingsForWeek();
  }, [selectedWeek]);

  const loadBookingsForWeek = async () => {
    setLoading(true);
    try {
      const result = await supabaseStaffService.getBookingsForWeek(selectedWeek);
      if (result.success) {
        setBookings(result.bookings);
      } else {
        console.error('Error loading bookings:', result.error);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // First day is Sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.date === dateStr);
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: CompletedBooking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const weekDays = getWeekDays();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 border-b">
        {dayNames.map((dayName, index) => (
          <div key={dayName} className="p-4 text-center border-r last:border-r-0">
            <div className="font-semibold text-gray-800">{dayName}</div>
            <div className="text-sm text-gray-500 mt-1">
              {weekDays[index].toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="grid grid-cols-7">
        {weekDays.map((date, index) => {
          const dayBookings = getBookingsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`min-h-[200px] p-2 border-r last:border-r-0 ${
                isToday ? 'bg-blue-50' : ''
              }`}
            >
              {/* Day number */}
              <div className={`text-sm font-medium mb-2 ${
                isToday ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {date.getDate()}
              </div>

              {/* Bookings for the day */}
              <div className="space-y-1">
                {dayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => onBookingClick(booking)}
                    className={`p-2 rounded-md text-xs cursor-pointer hover:shadow-sm transition-shadow ${getStatusColor(booking.status)}`}
                  >
                    <div className="font-medium truncate">
                      {booking.customerName}
                    </div>
                    <div className="text-xs opacity-75">
                      {formatTime(booking.startTime)}
                    </div>
                    <div className="text-xs opacity-75">
                      {booking.beach}
                    </div>
                    {booking.isPrivate && (
                      <div className="text-xs font-medium">Private</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {dayBookings.length === 0 && (
                <div className="text-xs text-gray-400 italic">
                  No lessons
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Confirmed ({bookings.filter(b => b.status === 'confirmed').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span>Completed ({bookings.filter(b => b.status === 'completed').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>Cancelled ({bookings.filter(b => b.status === 'cancelled').length})</span>
          </div>
          <div className="ml-auto font-medium">
            Total: {bookings.length} lesson{bookings.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
} 