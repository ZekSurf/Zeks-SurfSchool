import Image from 'next/image';
import { FC } from 'react';

const About: FC = () => {
  const features = {
    whyChooseZek: [
      { text: 'Expertise: Over 17 years of surfing experience & multiple regional competitions wins.' },
      { text: 'Patient Teaching Style: Clear and supportive instruction for all skill levels.' },
      { text: 'Safety First: Prioritizes a safe learning environment for every lesson.' },
      { text: 'Personalized Approach: Tailors lessons to meet individual needs and goals.' },
    ],
    whatToExpect: [
      { text: 'Personalized Instruction: Lessons tailored to your skill level and goals.' },
      { text: 'Safety Briefing: Comprehensive safety guidelines and procedures.' },
      { text: 'Equipment Provided: High-quality surfboards and wetsuits included.' },
      { text: 'Progressive Learning: Step-by-step guidance from basic techniques to advanced maneuvers.' },
    ],
  };

  const testimonials = [
    {
      name: 'Olivia B.',
      date: '2023-08-15',
      rating: 5,
      text: '"We signed up our two kids and they had a blast. Our instructor, Zek, was patient and really encouraged the kids. We will definitely be back!"',
    },
    {
      name: 'Chole W.',
      date: '2023-07-22',
      rating: 5,
      text: '"I\’d never even touched a surfboard before, but by the end of my hour private lesson with Zek, I was standing up and riding tiny waves on my own."',
    },
    {
      name: 'Ethan H.',
      date: '2023-06-10',
      rating: 4,
      text: '"I\’ve been surfing a couple of seasons but hit a plateau. Booked a private lesson, and he pinpointed a few tiny tweaks to my pop up and stance that made a huge difference."',
    },
  ];

  return (
    <div className="w-full bg-blue-50 py-16 px-4 min-[1024px]:px-16 min-[1280px]:px-24">
      {/* Introduction Section */}
      <div className="max-w-[1920px] mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Hi! My name is <span className="text-cyan-500">Zek</span>!
        </h1>
        <div className="space-y-8 text-gray-600 text-lg">
          <p>
            I've been surfing for my whole life, and nothing makes me happier than helping someone catch their first
            wave. My lessons are chill, fun, and tailored for beginners. Whether you're nervous, excited, or both — I've got
            you
          </p>
          <p>
            Over the years, I've competed in (and won) multiple regional surf competitions across Southern California.
            But what truly fuels me isn't trophies — it's watching someone catch their very first wave with a huge smile on
            their face.
          </p>
          <p>
            Learning to surf can feel intimidating — but it doesn't have to be. Whether you're showing up with zero
            experience or looking to sharpen your skills, I'll meet you where you're at.
          </p>
        </div>

        {/* Photo Gallery */}
        <div className="mt-16">
          {/* Mobile Layout (2-column grid) */}
          <div className="md:hidden grid grid-cols-2 gap-4 px-2">
            <div className="space-y-4">
              <div className="relative aspect-[3/2] w-full">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/surf-1.jpg"
                    alt="Beginner surfer riding a wave"
                    fill
                    sizes="(max-width: 768px) 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="relative aspect-[3/2] w-full">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/surf-3.jpg"
                    alt="Group surfing lesson"
                    fill
                    sizes="(max-width: 768px) 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="relative aspect-[3/2] w-full">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/surf-5.jpg"
                    alt="Surfer catching a wave"
                    fill
                    sizes="(max-width: 768px) 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative aspect-[3/2] w-full">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/surf-2.jpg"
                    alt="Surfer performing maneuver"
                    fill
                    sizes="(max-width: 768px) 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="relative aspect-[3/2] w-full">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/surf-4.jpg"
                    alt="Advanced surfing technique"
                    fill
                    sizes="(max-width: 768px) 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="relative aspect-[3/2] w-full">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/surf-6.jpg"
                    alt="Beautiful sunset surf session"
                    fill
                    sizes="(max-width: 768px) 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout (Fanned/Stacked) */}
          <div className="hidden md:block relative h-[700px] flex items-center justify-center">
            {/* First image - left */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[280px] z-20 transform -rotate-6">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/surf-1.jpg"
                  alt="Beginner surfer riding a wave"
                  fill
                  sizes="400px"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </div>

            {/* Second image - left center */}
            <div className="absolute left-[15%] top-[20%] w-[380px] h-[260px] z-10 transform rotate-3">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/surf-2.jpg"
                  alt="Surfer performing maneuver"
                  fill
                  sizes="380px"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </div>

            {/* Center image */}
            <div className="absolute left-1/2 -translate-x-1/2 w-[440px] h-[300px] z-30">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/surf-3.jpg"
                  alt="Group surfing lesson"
                  fill
                  sizes="440px"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </div>

            {/* Fourth image - right center */}
            <div className="absolute right-[15%] top-[25%] w-[380px] h-[260px] z-10 transform -rotate-3">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/surf-4.jpg"
                  alt="Advanced surfing technique"
                  fill
                  sizes="380px"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Fifth image - right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[280px] z-20 transform rotate-6">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/surf-5.jpg"
                  alt="Surfer catching a wave"
                  fill
                  sizes="400px"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Sixth image - bottom center */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[5%] w-[360px] h-[240px] z-40">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/surf-6.jpg"
                  alt="Beautiful sunset surf session"
                  fill
                  sizes="360px"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          {/* Why Choose Zek? */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Why Choose Zek?</h2>
            <ul className="space-y-4">
              {features.whyChooseZek.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-cyan-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-600">{feature.text}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* What to Expect */}
          <div>
            <h2 className="text-3xl font-bold mb-8">What to Expect</h2>
            <ul className="space-y-4">
              {features.whatToExpect.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-cyan-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-600">{feature.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-12 text-center">What Students are Saying</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.date}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 