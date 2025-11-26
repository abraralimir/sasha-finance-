'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/lib/types';
import { getUserData } from '@/lib/actions';
import KycFlow from './kyc-flow';
import HomeDashboard from './home-dashboard';
import StatusView from './status-view';
import { Loader2 } from 'lucide-react';

const MOCK_USER_ID = 'default_user';

export default function UserFlowController() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserData();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Polling mechanism to check for status updates
  useEffect(() => {
    if (!user || (user.kycStatus !== 'pending' && user.loanStatus !== 'pending' && user.loanStatus !== 'review')) {
      return;
    }

    const interval = setInterval(async () => {
      const updatedUser = await getUserData();
      if (updatedUser.kycStatus !== user.kycStatus || updatedUser.loanStatus !== user.loanStatus) {
        setUser(updatedUser);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleKycSuccess = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-primary">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <StatusView status="error" title="Error" message="Could not load user data." />;
  }
  
  switch (user.kycStatus) {
    case 'unverified':
      return <KycFlow onKycSuccess={handleKycSuccess} />;
    case 'pending':
      return <StatusView status="pending" title="Verification Pending" message={user.kycReason || 'Your information is being verified.'} />;
    case 'rejected':
      return <StatusView status="rejected" title="Verification Rejected" message={user.kycReason || 'Your KYC verification failed.'} />;
    case 'approved':
      return <HomeDashboard user={user} onUpdate={setUser} />;
    default:
      return <StatusView status="error" title="Error" message="An unknown error occurred." />;
  }
}
