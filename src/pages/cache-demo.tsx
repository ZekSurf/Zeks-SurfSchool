import Head from 'next/head';
import { CacheDemo } from '@/components/CacheDemo';

export default function CacheDemoPage() {
  return (
    <>
      <Head>
        <title>Cache System Demo - Zeko Surf School</title>
        <meta name="description" content="Demonstration of the booking cache system functionality" />
      </Head>

      <main className="min-h-screen bg-gray-50 py-8">
        <CacheDemo />
      </main>
    </>
  );
} 