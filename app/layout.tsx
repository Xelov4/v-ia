import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Video-IA.net - AI Tools Directory',
  description: 'Discover the best AI tools for video creation, content generation, and more. Browse thousands of AI-powered tools categorized by use case.',
  keywords: 'AI tools, video AI, content creation, artificial intelligence, AI directory',
  authors: [{ name: 'Video-IA.net' }],
  openGraph: {
    title: 'Video-IA.net - AI Tools Directory',
    description: 'Discover the best AI tools for video creation, content generation, and more.',
    url: 'https://www.video-ia.net',
    siteName: 'Video-IA.net',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video-IA.net - AI Tools Directory',
    description: 'Discover the best AI tools for video creation, content generation, and more.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
} 