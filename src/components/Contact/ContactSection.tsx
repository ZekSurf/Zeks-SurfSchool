import React from 'react';

export const ContactSection = () => {
  return (
    <section className="w-full bg-white py-16 px-4 min-[1024px]:px-16 min-[1280px]:px-24">
      <div className="max-w-[1920px] mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Got a Question?</h1>
        
        <div className="max-w-[1200px] mx-auto mt-12 px-4 sm:px-6 lg:px-8">
          <form className="space-y-8">
            <div>
              <input
                type="text"
                placeholder="Name"
                className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1DA9C7] font-poppins text-lg"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1DA9C7] font-poppins text-lg"
              />
            </div>
            <div>
              <textarea
                placeholder="Message"
                rows={6}
                className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1DA9C7] font-poppins resize-none text-lg"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-[#1DA9C7] text-white px-8 py-4 rounded-xl font-poppins font-medium hover:bg-[#1897B2] transition-colors text-lg"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}; 