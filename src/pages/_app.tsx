import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { CartProvider } from '@/context/CartContext'
import Head from 'next/head'
import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Register service worker for push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <>
      <Head>
        {/* Google Ads (gtag.js) - Global Tracking */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-17228135601"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17228135601');
            `,
          }}
        />
        
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Surf Staff" />
        <link rel="apple-touch-icon" href="/zek-surf.png" />
      </Head>
    <CartProvider>
      <Component {...pageProps} />
      <Analytics />
    </CartProvider>
    </>
  )
} 