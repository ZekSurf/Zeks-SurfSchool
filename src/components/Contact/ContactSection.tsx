import React from 'react';

export const ContactSection = () => {
  return (
    <section className="w-full bg-white py-16 px-4 min-[1024px]:px-16 min-[1280px]:px-24">
      <div className="max-w-[1920px] mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Got a Question?</h1>
        
        {/* Contact Information */}
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center items-center space-x-6 text-lg">
            <a 
              href="tel:+1-808-938-6347" 
              className="flex items-center space-x-2 text-[#1DA9C7] hover:text-[#1897B2] transition-colors"
            >
              <span>📞</span>
              <span>(808) 938-6347</span>
            </a>
            <a 
              href="mailto:zeksurfschool@gmail.com" 
              className="flex items-center space-x-2 text-[#1DA9C7] hover:text-[#1897B2] transition-colors"
            >
              <span>✉️</span>
              <span>zeksurfschool@gmail.com</span>
            </a>
          </div>
          <p className="text-gray-600">📍 Serving San Onofre, Doheny & T-Street Beaches, CA</p>
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-8">
          <p className="text-xl text-gray-700 mb-6">Ready to catch your first wave?</p>
          <a 
            href="/#booking" 
            className="inline-block bg-[#1DA9C7] text-white px-8 py-4 rounded-xl font-poppins font-medium hover:bg-[#1897B2] transition-colors text-lg"
            >
            Book Your Lesson Now
          </a>
        </div>
      </div>
    </section>
  );
}; 