import React from 'react';
import { X } from 'lucide-react';

interface BeachDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  beach: {
    name: string;
    location: string;
    fullDescription: string;
    mapUrl: string;
  };
}

export const BeachDetailsModal: React.FC<BeachDetailsModalProps> = ({
  isOpen,
  onClose,
  beach
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">{beach.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Map Section */}
          <div className="aspect-video w-full rounded-lg overflow-hidden">
            <iframe
              src={beach.mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map showing location of ${beach.name}`}
            ></iframe>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Location</h3>
            <p className="text-gray-600">{beach.location}</p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">About {beach.name}</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{beach.fullDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 