import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Waves, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Beach {
  name: string;
  lat: number;
  lng: number;
}

const beaches: Beach[] = [
  {
    name: "Doheny State Beach",
    lat: 33.4625,
    lng: -117.6857
  },
  {
    name: "San Onofre Beach",
    lat: 33.3728,
    lng: -117.5656
  },
  {
    name: "T-Street Beach",
    lat: 33.4164,
    lng: -117.6177
  }
];

interface SurfDataPayload {
  lat: number;
  lng: number;
  dateTime: string;
}

export const SurfDataTester: React.FC = () => {
  const [selectedBeach, setSelectedBeach] = useState<Beach>(beaches[0]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestSurfData = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const payload: SurfDataPayload = {
      lat: selectedBeach.lat,
      lng: selectedBeach.lng,
      dateTime: `${selectedDate}T${selectedTime}:00Z`
    };

    try {
      // Replace with your actual n8n surf data webhook URL
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_SURF_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/surf-data';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch surf data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-pacifico text-primary">Surf Data Tester</h2>
              <p className="text-sm text-gray-600">Test n8n surf & weather workflow</p>
            </div>
          </div>
        </div>

        {/* Beach Picker */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Select Beach
          </label>
          <select
            value={beaches.findIndex(beach => beach.name === selectedBeach.name)}
            onChange={(e) => setSelectedBeach(beaches[parseInt(e.target.value)])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {beaches.map((beach, index) => (
              <option key={beach.name} value={index}>
                {beach.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Coordinates: {selectedBeach.lat}°N, {Math.abs(selectedBeach.lng)}°W
          </p>
        </div>

        {/* Date Picker */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Time Picker */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Time (UTC)
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Payload Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payload Preview
          </label>
          <div className="bg-gray-100 p-3 rounded-lg">
            <pre className="text-xs text-gray-700 overflow-x-auto">
{JSON.stringify({
  lat: selectedBeach.lat,
  lng: selectedBeach.lng,
  dateTime: `${selectedDate}T${selectedTime}:00Z`
}, null, 2)}
            </pre>
          </div>
        </div>

        {/* Test Button */}
        <Button
          onClick={handleTestSurfData}
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mb-6"
        >
          <Send className="w-4 h-4 mr-2" />
          Test Surf Data Workflow
        </Button>

        {/* Response/Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">Error:</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {response && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">Response:</h4>
            <pre className="text-xs text-green-700 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Instructions:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Select a beach from the dropdown</li>
            <li>• Choose date and time for surf forecast</li>
            <li>• Click "Test" to send data to n8n workflow</li>
            <li>• View the surf/weather response below</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}; 