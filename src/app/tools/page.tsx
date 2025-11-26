import MainHeader from '@/components/main-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MutualFundCalculator from '@/components/user/mutual-fund-calculator';
import SipCalculator from '@/components/user/sip-calculator';

export default function ToolsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainHeader />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <h1 className="font-headline text-4xl text-primary mb-2">
            Financial Calculators
          </h1>
          <p className="text-muted-foreground mb-8">
            Plan your investments with our easy-to-use tools.
          </p>

          <Tabs defaultValue="sip" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sip">SIP Calculator</TabsTrigger>
              <TabsTrigger value="mutual-fund">
                Mutual Fund Calculator
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sip">
              <SipCalculator />
            </TabsContent>
            <TabsContent value="mutual-fund">
              <MutualFundCalculator />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
