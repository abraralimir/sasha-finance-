'use client';

import { CheckCircle, Clock, XCircle, Send } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';


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
  initialUsers: User[];
}) {

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Loan Status</TableHead>
                <TableHead className="text-right">Loan Amount</TableHead>
                <TableHead>AI Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <StatusIcon status={user.loanStatus} />
                        <span className="capitalize">{user.loanStatus}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.loanAmount ? `$${user.loanAmount.toLocaleString()}` : 'N/A'}
                  </TableCell>
                  <TableCell className="max-w-sm truncate text-muted-foreground">{user.loanReason || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
