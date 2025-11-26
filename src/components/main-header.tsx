import Link from 'next/link';
import AurumLogo from './aurum-logo';
import { Button } from './ui/button';
import { UserCog } from 'lucide-react';

const MainHeader = () => {
  return (
    <header className="w-full p-4 sm:p-6 border-b border-b-primary/10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <AurumLogo />
        </Link>
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin1333" aria-label="Admin Dashboard">
            <UserCog className="h-5 w-5 text-primary/80" />
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default MainHeader;
