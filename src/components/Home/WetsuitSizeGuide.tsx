import React from 'react';

interface WetsuitSizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WetsuitSizeGuide: React.FC<WetsuitSizeGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Wetsuit Size Guide</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <p className="text-gray-600">
              To find your perfect wetsuit size, use the measurements below. For the best fit, measure yourself in your underwear.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Size</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Height (cm)</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Weight (kg)</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Chest (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2">XS</td>
                    <td className="px-4 py-2">152-160</td>
                    <td className="px-4 py-2">45-55</td>
                    <td className="px-4 py-2">81-86</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">S</td>
                    <td className="px-4 py-2">158-166</td>
                    <td className="px-4 py-2">50-60</td>
                    <td className="px-4 py-2">86-91</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">M</td>
                    <td className="px-4 py-2">164-172</td>
                    <td className="px-4 py-2">55-70</td>
                    <td className="px-4 py-2">91-97</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">L</td>
                    <td className="px-4 py-2">170-178</td>
                    <td className="px-4 py-2">65-80</td>
                    <td className="px-4 py-2">97-102</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">XL</td>
                    <td className="px-4 py-2">176-184</td>
                    <td className="px-4 py-2">75-90</td>
                    <td className="px-4 py-2">102-107</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">XXL</td>
                    <td className="px-4 py-2">182-190</td>
                    <td className="px-4 py-2">85-100</td>
                    <td className="px-4 py-2">107-112</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-4 text-gray-600">
              <h3 className="font-semibold text-gray-900">How to Measure</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Height: Stand straight against a wall and measure from floor to top of head</li>
                <li>Weight: Use a scale in the morning before eating</li>
                <li>Chest: Measure around the fullest part of your chest, keeping the tape horizontal</li>
              </ul>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm">
                  <span className="font-semibold">Pro Tip:</span> If you're between sizes, we recommend going with the larger size for comfort. The wetsuit should be snug but not restrictive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 