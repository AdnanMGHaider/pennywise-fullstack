import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { RefreshProvider } from '@/contexts/RefreshContext'; // Import RefreshProvider
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Pennywise - AI-Powered Personal Finance Dashboard',
  description: 'Track your spending, set financial goals, and get AI-generated money-saving advice.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <RefreshProvider>
            {children}
            <Toaster />
          </RefreshProvider>
        </AuthProvider>
      </body>
    </html>
  );
}