// app/admin/profile/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react'; 

// Import shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function AdminProfilePage() {
  const { data: session, update: updateSession } = useSession();
  
  // States for form fields
  // 1. We keep track of the NEW email input
  const [newEmail, setNewEmail] = useState(session?.user?.email || '');
  // 2. Passwords
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // States for UI feedback
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentEmail = session?.user?.email || 'Loading...';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setMessage('');

    // --- Validation Checks (Same as before) ---
    if (newPassword && newPassword !== confirmNewPassword) {
      setStatus('error');
      setMessage('New password and confirmation password do not match.');
      return;
    }

    if (!currentPassword) {
      setStatus('error');
      setMessage('You must enter your current password to make any changes.');
      return;
    }

    const emailChanged = newEmail !== currentEmail;
    const passwordSet = !!newPassword;

    if (!emailChanged && !passwordSet) {
      setStatus('error');
      setMessage('Enter a new email or new password to update your profile.');
      return;
    }
    // --- End Validation Checks ---

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newEmail: emailChanged ? newEmail : undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Profile updated successfully!');
        
        // Clear sensitive fields and password fields on success
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        
        // Update the NextAuth session if the email was successfully changed
        if (emailChanged) {
            await updateSession({ user: { email: newEmail } });
        }
        
      } else {
        setStatus('error');
        setMessage(data.message || 'An error occurred during update.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Could not connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Admin Profile Settings</CardTitle>
          <CardDescription>
            Update your email address or password. **Current password is required** to save any changes.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-6">
            
            {/* Status Message */}
            {message && (
              <Alert variant={status === 'error' ? "destructive" : "default"} className={status === 'success' ? 'border-green-500' : ''}>
                {status === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                <AlertTitle>{status === 'error' ? 'Update Failed' : 'Success'}</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* 1. Existing Email (Read Only) */}
            <div className="grid gap-2">
              <Label htmlFor="existing-email">Current Email Address</Label>
              <Input
                id="existing-email"
                type="email"
                value={currentEmail}
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            
            {/* 2. New Email Field */}
            <div className="grid gap-2">
              <Label htmlFor="new-email">New Email Address</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            {/* 3. Current Password Field (Required for all updates) */}
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password (Required)</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password to verify identity"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required={true}
              />
            </div>

            {/* 4. New Password Field */}
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {/* 5. Confirm New Password Field */}
            <div className="grid gap-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={!newPassword} 
              />
            </div>

          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Changes...' : 'Update Profile'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
