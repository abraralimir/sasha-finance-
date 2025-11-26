'use client';

import { CheckCircle, Home, User, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { LoanApplicationData } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';


const StatusIcon = ({ status }: { status: 'approved' | 'rejected' }) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
};

const LoanTypeIcon = ({ type }: { type: 'personal' | 'property' | undefined }) => {
    switch (type) {
        case 'personal':
            return <User className="h-5 w-5 text-blue-400" />;
        case 'property':
            return <Home className="h-5 w-5 text-orange-400" />;
        default:
            return null;
    }
}

export default function DashboardClient({
  initialApplications,
}: {
  initialApplications: (LoanApplicationData & {id: string, loanStatus: 'approved' | 'rejected', loanReason: string})[];
}) {

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Loan Status</TableHead>
                <TableHead className="text-right">Loan Amount</TableHead>
                <TableHead>Credit Score</TableHead>
                <TableHead>Annual Income</TableHead>
                <TableHead>AI Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialApplications.map(app => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.fullName || 'N/A'}</TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                        <LoanTypeIcon type={app.loanType} />
                        <span className="capitalize">{app.loanType || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <StatusIcon status={app.loanStatus} />
                        <span className="capitalize">{app.loanStatus}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {app.loanAmount ? `$${app.loanAmount.toLocaleString()}` : 'N/A'}
                  </TableCell>
                  <TableCell>{app.creditScore}</TableCell>
                  <TableCell>${app.annualIncome.toLocaleString()}</TableCell>
                  <TableCell className="max-w-sm truncate text-muted-foreground">{app.loanReason || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
