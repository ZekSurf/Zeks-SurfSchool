import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { blogPosts } from '@/data/blogPosts';

export const Blog: React.FC = () => {
  return (
    <section className="py-16 px-4 min-[1024px]:px-16 min-[1280px]:px-24 bg-gray-50">
      <div className="max-w-[1920px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl min-[427px]:text-3xl min-[731px]:text-4xl font-bold mb-4">
            Surf Tips, Stories & Spot Guides <span className="inline-block animate-bounce">🏄</span>
          </h2>
          <p className="text-gray-600 text-base min-[427px]:text-lg">A blog by Zek's Surf School</p>
        </div>

        <div className="space-y-6">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-4 min-[427px]:p-6 flex items-start gap-4 min-[427px]:gap-6">
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24 min-[427px]:w-32 min-[427px]:h-32 rounded-lg overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100px, 128px"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl min-[427px]:text-2xl font-bold mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm min-[427px]:text-base mb-4">{post.preview}</p>
                  <Link 
                    href={`/blog/${post.id}`}
                    className="text-[#1DA9C7] hover:text-[#1897B2] font-medium transition-colors text-sm min-[427px]:text-base"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 