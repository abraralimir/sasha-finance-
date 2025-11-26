'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock, XCircle, Send, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/lib/types';
import { updateLoanStatus } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type SummarizedUser = User & { summary: string };

const StatusIcon = ({ status }: { status: User['loanStatus'] }) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'review':
      return <Send className="h-5 w-5 text-yellow-500" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-blue-500" />;
    default:
      return null;
  }
};

export default function DashboardClient({
  initialUsers,
}: {
  initialUsers: SummarizedUser[];
}) {
  const [selectedUser, setSelectedUser] = useState<SummarizedUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const handleAction = (status: 'approved' | 'rejected') => {
    if (!selectedUser) return;

    if (status === 'rejected' && !rejectionReason.trim()) {
        toast({
            title: 'Error',
            description: 'Please provide a reason for rejection.',
            variant: 'destructive',
        });
        return;
    }

    startTransition(async () => {
      const reason = status === 'approved' ? 'Your loan has been approved by the administrator.' : rejectionReason;
      await updateLoanStatus(selectedUser.id, status, reason);
      toast({
        title: `Loan ${status}`,
        description: `The loan for ${selectedUser.fullName} has been ${status}.`,
      });
      setSelectedUser(null);
      setRejectionReason('');
      router.refresh();
    });
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead className="text-right">Loan Amount</TableHead>
                <TableHead>Loan Status</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialUsers.map(user => (
                <TableRow
                  key={user.id}
                  onClick={() => user.loanStatus === 'review' && setSelectedUser(user)}
                  className={user.loanStatus === 'review' ? 'cursor-pointer hover:bg-accent/50' : ''}
                >
                  <TableCell className="font-medium">{user.fullName || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={user.kycStatus === 'approved' ? 'default' : 'destructive'} className={user.kycStatus === 'approved' ? 'bg-green-700/20 text-green-400 border-green-700/30' : ''}>
                      {user.kycStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.loanAmount ? `$${user.loanAmount.toLocaleString()}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <StatusIcon status={user.loanStatus} />
                        <span className="capitalize">{user.loanStatus}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm truncate text-muted-foreground">{user.summary}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedUser && (
            <>
              <SheetHeader>
                <SheetTitle className="font-headline text-primary">Loan Review</SheetTitle>
                <SheetDescription>
                  Review and approve or reject the loan application for {selectedUser.fullName}.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Applicant Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p><strong>Name:</strong> {selectedUser.fullName}</p>
                        <p><strong>Loan Amount:</strong> ${selectedUser.loanAmount?.toLocaleString()}</p>
                        <p><strong>Credit Score:</strong> {selectedUser.creditScore}</p>
                        <p><strong>Annual Income:</strong> ${selectedUser.annualIncome?.toLocaleString()}</p>
                        <p><strong>Employment:</strong> {selectedUser.employmentStatus}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>AI Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground italic">{selectedUser.loanReason}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Action</CardTitle>
                        <CardDescription>Provide a reason for rejection.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="mb-4"
                        />
                         <div className="flex justify-end gap-4">
                            <Button variant="destructive" onClick={() => handleAction('rejected')} disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Reject
                            </Button>
                            <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction('approved')} disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Approve
                            </Button>
                        </div>
                    </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
