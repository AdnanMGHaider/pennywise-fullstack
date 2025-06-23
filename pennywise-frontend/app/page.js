'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-morphism border-b border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Pennywise</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white glow-effect">
                Sign Up
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Meet <span className="gradient-text">Pennywise</span>
              <br />
              Your AI Finance <span className="glow-text">Companion</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Track your spending, set financial goals, and get AI-generated money-saving advice — 
              all in one beautiful, intelligent interface.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-lg glow-effect animate-glow"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              
              <Link href="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white px-8 py-4 text-lg"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-slide-up">
            <div className="glass-morphism p-8 rounded-2xl hover:glow-effect transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Smart Analytics</h3>
              <p className="text-gray-400">
                Get deep insights into your spending patterns with beautiful charts and AI-powered analysis.
              </p>
            </div>

            <div className="glass-morphism p-8 rounded-2xl hover:glow-effect transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">AI-Powered Advice</h3>
              <p className="text-gray-400">
                Receive personalized financial recommendations and money-saving tips powered by AI.
              </p>
            </div>

            <div className="glass-morphism p-8 rounded-2xl hover:glow-effect transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Secure & Private</h3>
              <p className="text-gray-400">
                Your financial data is encrypted and secure. We never share your personal information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-green-500/10 to-emerald-600/10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 gradient-text">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already saving money and achieving their financial goals with Pennywise.
          </p>
          <Link href="/register">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 py-4 text-lg glow-effect"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Pennywise</span>
          </div>
          <p className="text-gray-400">
            © 2025 Pennywise. All rights reserved. Made with ❤️ for your financial future.
          </p>
        </div>
      </footer>
    </div>
  );
}