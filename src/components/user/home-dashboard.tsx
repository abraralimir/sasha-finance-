'use client';

import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedBox from '../animated-box';
import LoanChatter from './loan-chatter';

interface HomeDashboardProps {
  user: User;
  onUpdate: (user: User) => void;
}

export default function HomeDashboard({ user, onUpdate }: HomeDashboardProps) {
  return (
    <AnimatedBox className="w-full max-w-2xl">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-primary">
            Welcome, {user.fullName?.split(' ')[0]}
          </CardTitle>
          <CardDescription>Your secure financing portal.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoanChatter user={user} onUpdate={onUpdate} />
        </CardContent>
      </Card>
    </AnimatedBox>
  );
}
