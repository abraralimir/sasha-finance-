import DashboardClient from './dashboard-client';
import MainHeader from '@/components/main-header';
import { getAllApplications } from '@/lib/data';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'View all submitted loan applications.',
  robots: {
    index: false,
    follow: false,
  },
};


export default async function AdminPage() {
  const applications = await getAllApplications();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainHeader />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <h1 className="font-headline text-4xl text-primary mb-2">Loan Applications</h1>
          <p className="text-muted-foreground mb-8">
            View all submitted loan applications.
          </p>
          <DashboardClient initialApplications={applications} />
        </div>
      </main>
    </div>
  );
}
