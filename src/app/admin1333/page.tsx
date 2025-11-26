import { getAllUsersForAdmin } from '@/lib/actions';
import DashboardClient from './dashboard-client';
import MainHeader from '@/components/main-header';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const users = await getAllUsersForAdmin();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainHeader />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <h1 className="font-headline text-4xl text-primary mb-2">User Overview</h1>
          <p className="text-muted-foreground mb-8">
            View all onboarded users and their status.
          </p>
          <DashboardClient initialUsers={users} />
        </div>
      </main>
    </div>
  );
}
