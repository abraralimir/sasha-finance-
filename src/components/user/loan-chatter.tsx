'use client';

import { useState, useTransition } from 'react';
import type { User } from '@/lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { submitLoanRequest } from '@/lib/actions';
import { CheckCircle, Loader2, Send, XCircle } from 'lucide-react';
import StatusView from './status-view';

interface LoanChatterProps {
  user: User;
  onUpdate: (user: User) => void;
}

export default function LoanChatter({ user, onUpdate }: LoanChatterProps) {
  const [loanAmount, setLoanAmount] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(loanAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid loan amount.', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      try {
        const updatedUser = await submitLoanRequest(amount);
        onUpdate(updatedUser);
        toast({ title: 'Request Submitted', description: 'Your loan request is being assessed by our AI.' });
      } catch (error) {
        toast({ title: 'Submission Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.', variant: 'destructive' });
      }
    });
  };

  if (user.loanStatus !== 'none') {
    const statusMap = {
        pending: { status: 'pending', title: 'Assessing Application...' },
        review: { status: 'pending', title: 'Pending Admin Review' },
        approved: { status: 'approved', title: 'Loan Approved!' },
        rejected: { status: 'rejected', title: 'Loan Application Rejected' },
    };
    
    const currentStatus = statusMap[user.loanStatus as keyof typeof statusMap];

    if (currentStatus) {
        if (currentStatus.status === 'approved') {
            return (
                <div className="text-center p-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="font-headline text-3xl text-primary">{currentStatus.title}</h3>
                    <p className="text-muted-foreground mt-2">{user.loanReason}</p>
                </div>
            );
        }
        return <StatusView status={currentStatus.status as any} title={currentStatus.title} message={user.loanReason || ''} />;
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-muted-foreground">Ready for the next step? Tell Sasha, your AI loan advisor, how much you need.</p>
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <span className="text-2xl text-primary font-bold">$</span>
        <Input
          type="number"
          placeholder="50,000"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
          className="text-lg"
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending} size="icon">
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </form>
    </div>
  );
}
