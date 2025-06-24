"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function ClientAuthWrapper({ children }) {
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
