import UserFlowController from '@/components/user/user-flow-controller';
import MainHeader from '@/components/main-header';

export default function SashaLoansPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainHeader />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <UserFlowController />
      </main>
    </div>
  );
}
