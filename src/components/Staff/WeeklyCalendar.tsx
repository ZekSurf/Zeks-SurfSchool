import React, { useState, useEffect } from 'react';
import { CompletedBooking } from '@/types/booking';

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
      const startDate = selectedWeek.toISOString();
      const response = await fetch(`/api/staff/get-weekly-bookings?startDate=${encodeURIComponent(startDate)}`);
      const result = await response.json();
      
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
    
    // Normalize to prevent timezone issues
    startOfWeek.setHours(12, 0, 0, 0); // Use noon to avoid DST issues

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings
      .filter(booking => booking.date === dateStr)
      .sort((a, b) => {
        // Sort by start time (earliest first)
        const timeA = new Date(a.startTime).getTime();
        const timeB = new Date(b.startTime).getTime();
        return timeA - timeB;
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
      {/* Desktop Calendar Header */}
      <div className="hidden md:grid grid-cols-7 border-b">
        {dayNames.map((dayName, index) => {
          const headerDate = weekDays[index];
          const dateStr = headerDate.toISOString().split('T')[0];
          const displayDate = new Date(dateStr + 'T12:00:00'); // Force noon UTC to avoid timezone issues
          
          return (
            <div key={dayName} className="p-4 text-center border-r last:border-r-0">
              <div className="font-semibold text-gray-800">{dayName}</div>
              <div className="text-sm text-gray-500 mt-1">
                {displayDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  timeZone: 'UTC'
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Calendar Body */}
      <div className="hidden md:grid grid-cols-7">
        {weekDays.map((date, index) => {
          const dayBookings = getBookingsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={date.toISOString().split('T')[0]}
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

      {/* Mobile Calendar - Vertical Layout */}
      <div className="md:hidden">
        {weekDays.map((date, index) => {
          const dayBookings = getBookingsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={date.toISOString().split('T')[0]}
              className={`border-b last:border-b-0 ${
                isToday ? 'bg-blue-50' : ''
              }`}
            >
              {/* Mobile Day Header */}
              <div className={`p-4 border-b bg-gray-50 ${
                isToday ? 'bg-blue-100' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-semibold text-lg ${
                      isToday ? 'text-blue-600' : 'text-gray-800'
                    }`}>
                      {dayNames[index]}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(date.toISOString().split('T')[0] + 'T12:00:00').toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        timeZone: 'UTC'
                      })}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    isToday ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {date.getDate()}
                  </div>
                </div>
              </div>

              {/* Mobile Bookings List */}
              <div className="p-4">
                {dayBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-lg mb-1">📅</div>
                    <div className="text-sm">No lessons scheduled</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => onBookingClick(booking)}
                        className={`p-4 rounded-lg border-2 cursor-pointer active:scale-95 transition-all ${getStatusColor(booking.status)} hover:shadow-md`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-semibold text-base">
                            {booking.customerName}
                          </div>
                          {booking.isPrivate && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Private
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm opacity-90">
                          <div className="flex items-center gap-1">
                            <span>🕒</span>
                            <span>{formatTime(booking.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>🏖️</span>
                            <span>{booking.beach}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs opacity-75">
                          Tap for details
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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