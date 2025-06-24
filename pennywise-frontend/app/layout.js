import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { RefreshProvider } from "@/contexts/RefreshContext";
import { Toaster } from "@/components/ui/sonner";
import ClientAuthWrapper from "./ClientAuthWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pennywise - AI-Powered Personal Finance Dashboard",
  description:
    "Track your spending, set financial goals, and get AI-generated money-saving advice.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <RefreshProvider>
            <ClientAuthWrapper>{children}</ClientAuthWrapper>
            <Toaster />
          </RefreshProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
