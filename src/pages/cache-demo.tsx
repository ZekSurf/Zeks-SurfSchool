import Head from 'next/head';
import { CacheDemo } from '@/components/CacheDemo';

export default function CacheDemoPage() {
  return (
    <>
      <Head>
        <title>Cache System Demo - Zek's Surf School</title>
        <meta name="description" content="Demonstration of the booking cache system functionality" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
        <link rel="apple-touch-icon" href="/zeks-logo.png" />
      </Head>

      <main className="min-h-screen bg-gray-50 py-8">
        <CacheDemo />
      </main>
    </>
  );
} 