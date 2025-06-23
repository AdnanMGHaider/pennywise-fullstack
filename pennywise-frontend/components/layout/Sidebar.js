'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  CreditCard,
  Target,
  PiggyBank,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Budgets', href: '/budgets', icon: PiggyBank },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 hover:bg-gray-700 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 glass-morphism border-r border-gray-700 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-3 p-6 border-b border-gray-700">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Pennywise</span>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{user?.name || 'User'}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white glow-effect' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-700">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-red-600/20"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}