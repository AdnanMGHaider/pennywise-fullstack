'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Trash2,
  Save,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    timezone: 'UTC-5'
  });

  // Security settings
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: false,
    marketingEmails: false
  });

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!securityData.currentPassword || !securityData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (securityData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmed) {
      toast.error('Account deletion is not available in demo mode');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences and security settings</p>
        </div>

        {/* Profile Settings */}
        <Card className="glass-morphism border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-green-400" />
              <CardTitle className="text-white">Profile Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="timezone" className="text-gray-300">Timezone</Label>
                <Input
                  id="timezone"
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleProfileUpdate}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="glass-morphism border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-white">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            
            <Button 
              onClick={handlePasswordChange}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="glass-morphism border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-white">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                      {key === 'budgetAlerts' && 'Get notified when you approach budget limits'}
                      {key === 'goalReminders' && 'Receive reminders about your financial goals'}
                      {key === 'weeklyReports' && 'Get weekly financial summary reports'}
                      {key === 'marketingEmails' && 'Receive promotional emails and product updates'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, [key]: checked})
                    }
                  />
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleNotificationUpdate}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="glass-morphism border-red-500/50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <CardTitle className="text-white">Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-2">Delete Account</h4>
              <p className="text-gray-300 text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain.
                All your data including transactions, goals, and budgets will be permanently deleted.
              </p>
              <Button
                onClick={handleDeleteAccount}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}