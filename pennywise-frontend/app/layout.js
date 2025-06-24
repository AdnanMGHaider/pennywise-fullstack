'use client'; // Make RootLayout a client component to use context

import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider, useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { RefreshProvider } from '@/contexts/RefreshContext';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Pennywise - AI-Powered Personal Finance Dashboard',
  description: 'Track your spending, set financial goals, and get AI-generated money-saving advice.',
};

function AuthWrapper({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  return <>{children}</>;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <RefreshProvider>
            <AuthWrapper>{children}</AuthWrapper>
            <Toaster />
          </RefreshProvider>
        </AuthProvider>
      </body>
    </html>
  );
}