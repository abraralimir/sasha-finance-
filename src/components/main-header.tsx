import Link from 'next/link';
import AurumLogo from './aurum-logo';
import { Button } from './ui/button';
import { UserCog, UserPlus, Calculator } from 'lucide-react';

const MainHeader = () => {
  return (
    <header className="w-full p-4 sm:p-6 border-b border-b-primary/10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <AurumLogo />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/tools" aria-label="Financial Tools">
              <Calculator className="h-5 w-5 text-primary/80" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin1333/add-user" aria-label="Add User">
              <UserPlus className="h-5 w-5 text-primary/80" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin1333" aria-label="Admin Dashboard">
              <UserCog className="h-5 w-5 text-primary/80" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
