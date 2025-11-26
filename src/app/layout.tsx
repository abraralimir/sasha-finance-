import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';
import { Alegreya, Belleza } from 'next/font/google';

const alegreya = Alegreya({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-alegreya',
});

const belleza = Belleza({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-belleza',
  weight: '400',
});

const siteName = 'Aurum Finance';
const description = 'Aurum Finance offers AI-powered luxury financing solutions and investment planning tools to help you achieve your financial goals.';
const url = 'https://sasha-finance-st.apphosting.dev/'; // Replace with your actual domain

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: ['luxury finance', 'ai loan', 'personal loan', 'property loan', 'investment calculator', 'sip calculator', 'mutual fund calculator'],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: siteName,
    description,
    url,
    siteName,
    type: 'website',
    images: [
      {
        url: `${url}/og-image.png`, // You should create this image
        width: 1200,
        height: 630,
        alt: 'Aurum Finance - AI-Powered Luxury Financing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description,
    images: [`${url}/og-image.png`], // You should create this image
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${alegreya.variable} ${belleza.variable}`}>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
        )}
      >
        <FirebaseClientProvider>{children}</FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
