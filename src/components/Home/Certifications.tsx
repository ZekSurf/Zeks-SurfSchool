import React from 'react';
import Image from 'next/image';

export const Certifications = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            We're fully insured & certified—learn with confidence!
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
            {/* Insurance Badge */}
            <div className="flex flex-col items-center group">
              <div className="relative w-40 h-40 mb-4 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                <Image
                  src="/example_isurance.jpg"
                  alt="Certificate of Insurance"
                  fill
                  className="object-cover"
                  sizes="(max-width: 160px) 100vw, 160px"
                />
              </div>
              <p className="text-sm font-medium text-gray-600">Certificate of Insurance</p>
            </div>

            {/* CPR Certification */}
            <div className="flex flex-col items-center group">
              <div className="relative w-40 h-40 mb-4 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                <Image
                  src="/example_cpr_card.jpg"
                  alt="CPR Certification"
                  fill
                  className="object-cover"
                  sizes="(max-width: 160px) 100vw, 160px"
                />
              </div>
              <p className="text-sm font-medium text-gray-600">CPR Certified</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 