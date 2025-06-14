import React from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Layout } from '@/components/Layout/Layout';
import { blogPosts } from '@/data/blogPosts';
import type { BlogPost } from '@/data/blogPosts';

interface BlogPostPageProps {
  post: BlogPost;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = blogPosts.map(post => ({
    params: { id: post.id }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = blogPosts.find(p => p.id === params?.id);

  if (!post) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      post
    }
  };
};

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post }) => {
  return (
    <>
      <Layout>
        <article className="max-w-4xl mx-auto px-4 py-8 min-[427px]:py-12">
          {/* Back to Blog Link */}
          <Link 
            href="/#blog" 
            className="text-[#1DA9C7] hover:text-[#1897B2] font-medium mb-6 min-[427px]:mb-8 inline-block text-sm min-[427px]:text-base"
          >
            ← Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-8 min-[427px]:mb-12">
            <h1 className="text-2xl min-[427px]:text-3xl min-[731px]:text-4xl font-bold text-gray-900 mb-3 min-[427px]:mb-4">{post.title}</h1>
            <div className="text-gray-600 text-sm min-[427px]:text-base">{post.date}</div>
          </header>

          {/* Featured Image */}
          <div className="relative w-full h-[250px] min-[427px]:h-[400px] mb-8 min-[427px]:mb-12 rounded-2xl overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content */}
          <div className="prose prose-sm min-[427px]:prose-base min-[731px]:prose-lg max-w-none">
            {post.content.map((section, index) => (
              <div key={index} className="mb-6 min-[427px]:mb-8">
                {section.type === 'paragraph' && (
                  <p className="text-gray-600 leading-relaxed text-sm min-[427px]:text-base mb-4 min-[427px]:mb-6">{section.content}</p>
                )}
                {section.type === 'heading' && (
                  <h2 className="text-xl min-[427px]:text-2xl font-bold text-gray-900 mb-3 min-[427px]:mb-4">{section.content}</h2>
                )}
                {section.type === 'list' && (
                  <ul className="list-disc list-inside space-y-2 min-[427px]:space-y-3 text-gray-600 text-sm min-[427px]:text-base mb-4 min-[427px]:mb-6">
                    {section.items?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.type === 'tip' && (
                  <div className="bg-blue-50 border-l-4 border-[#1DA9C7] p-4 min-[427px]:p-6 mb-4 min-[427px]:mb-6">
                    <p className="font-medium text-gray-900 mb-2 text-sm min-[427px]:text-base">Pro Tip:</p>
                    <p className="text-gray-600 text-sm min-[427px]:text-base">{section.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-8 min-[427px]:mt-12 p-6 min-[427px]:p-8 bg-white rounded-2xl shadow-md">
            <h3 className="text-xl min-[427px]:text-2xl font-bold mb-3 min-[427px]:mb-4">Ready to Start Your Surfing Journey?</h3>
            <p className="text-gray-600 mb-4 min-[427px]:mb-6 text-sm min-[427px]:text-base">
              Whether you're a complete beginner or looking to improve your skills, 
              I'm here to help you catch the perfect wave.
            </p>
            <Link 
              href="/#booking"
              className="inline-block bg-[#1DA9C7] text-white px-6 min-[427px]:px-8 py-2.5 min-[427px]:py-3 rounded-lg hover:bg-[#1897B2] transition-colors text-sm min-[427px]:text-base"
            >
              Book a Lesson
            </Link>
          </div>
        </article>
      </Layout>
    </>
  );
};

export default BlogPostPage; 