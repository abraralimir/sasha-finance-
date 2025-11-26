'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { submitLoanApplication } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Loader2,
  ArrowRight,
  Banknote,
  Send,
  CheckCircle,
  XCircle,
  User,
  PiggyBank,
  TrendingUp,
  Briefcase,
} from 'lucide-react';
import AnimatedBox from '@/components/animated-box';
import AurumLogo from '../aurum-logo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const loanApplicationSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  loanAmount: z.coerce
    .number()
    .min(1000, 'Loan amount must be at least $1,000.'),
  creditScore: z.coerce
    .number()
    .min(300, 'Credit score must be at least 300.')
    .max(850, 'Credit score cannot exceed 850.'),
  annualIncome: z.coerce
    .number()
    .min(10000, 'Annual income must be at least $10,000.'),
  employmentStatus: z.enum([
    'employed',
    'self-employed',
    'student',
    'unemployed',
  ]),
});

const bankDetailsSchema = z.object({
  accountNumber: z.string().length(12, 'Account number must be 12 digits.'),
  ifscCode: z.string().length(3, 'Code must be 3 digits.'),
});

type LoanApplicationData = z.infer<typeof loanApplicationSchema>;

const formSteps = [
  {
    field: 'fullName',
    label: 'Full Name',
    placeholder: 'Jane Doe',
    type: 'text',
    icon: User,
  },
  {
    field: 'loanAmount',
    label: 'Loan Amount',
    placeholder: '50000',
    type: 'number',
    icon: PiggyBank,
  },
  {
    field: 'creditScore',
    label: 'Credit Score',
    placeholder: '650',
    type: 'number',
    icon: TrendingUp,
  },
  {
    field: 'annualIncome',
    label: 'Annual Income',
    placeholder: '70000',
    type: 'number',
    icon: Banknote,
  },
  {
    field: 'employmentStatus',
    label: 'Employment Status',
    type: 'select',
    options: ['employed', 'self-employed', 'student', 'unemployed'],
    icon: Briefcase,
  },
] as const;

export default function LoanApplicationFlow() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0-4 for questions, 5 for loading, 6 for result, 7 for bank form, 8 for confirmation
  const [isPending, startTransition] = useTransition();
  const [assessmentResult, setAssessmentResult] = useState<{
    isEligible: boolean;
    reason: string;
  } | null>(null);
  const { toast } = useToast();

  const form = useForm<LoanApplicationData>({
    resolver: zodResolver(loanApplicationSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      loanAmount: 50000,
      creditScore: 650,
      annualIncome: 70000,
      employmentStatus: 'employed',
    },
  });

  const bankForm = useForm<z.infer<typeof bankDetailsSchema>>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountNumber: '',
      ifscCode: '',
    },
  });

  const handleNextStep = async () => {
    const field = formSteps[currentStep].field;
    const isValid = await form.trigger(field);

    if (isValid) {
      if (currentStep < formSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Last question answered, now submit
        onSubmit(form.getValues());
      }
    }
  };

  const onSubmit = (values: LoanApplicationData) => {
    setCurrentStep(formSteps.length); // Loading state
    startTransition(async () => {
      try {
        const { eligibility } = await submitLoanApplication(values);
        setAssessmentResult(eligibility);
        setCurrentStep(formSteps.length + 1); // Go to result step
      } catch (error) {
        toast({
          title: 'Submission Failed',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred.',
          variant: 'destructive',
        });
        setCurrentStep(0); // Go back to start on error
      }
    });
  };

  const onBankSubmit = (values: z.infer<typeof bankDetailsSchema>) => {
    startTransition(() => {
      // Simulate payment processing
      setTimeout(() => {
        setCurrentStep(formSteps.length + 3); // Move to final confirmation step
      }, 1500);
    });
  };

  const resetFlow = () => {
    setHasStarted(false);
    setCurrentStep(0);
    form.reset();
    bankForm.reset();
    setAssessmentResult(null);
  };
  
  const renderQuestion = () => {
    const stepInfo = formSteps[currentStep];
    const Icon = stepInfo.icon;
    
    return (
       <AnimatedBox key={currentStep} className="w-full max-w-lg">
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader>
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-accent rounded-lg text-primary">
                    <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="font-headline text-3xl text-primary">{stepInfo.label}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                  {stepInfo.type === 'select' ? (
                     <FormField
                      control={form.control}
                      name={stepInfo.field}
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stepInfo.options?.map(opt => <SelectItem key={opt} value={opt} className="capitalize">{opt.replace('-', ' ')}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name={stepInfo.field}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder={stepInfo.placeholder} {...field} type={stepInfo.type} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                 <Button type="submit" className="w-full" size="lg">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Next
                  </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </AnimatedBox>
    );
  };
  

  const renderContent = () => {
    if (currentStep < formSteps.length) {
      return renderQuestion();
    }
    
    switch (currentStep) {
      case formSteps.length: // Loading state
        return (
          <AnimatedBox key="loading" className="w-full max-w-lg text-center">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
              <CardHeader>
                <div className="flex justify-center mb-4"><Loader2 className="h-16 w-16 text-primary animate-spin" /></div>
                <CardTitle className="font-headline text-3xl text-primary">Assessing Eligibility...</CardTitle>
                <CardDescription>Our AI is analyzing your profile to find the best options.</CardDescription>
              </CardHeader>
            </Card>
          </AnimatedBox>
        );

      case formSteps.length + 1: // Result state
        if (!assessmentResult) return null;
        if (assessmentResult.isEligible) {
          return (
            <AnimatedBox key="approved" className="w-full max-w-lg text-center">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
                <CardHeader>
                  <div className="flex justify-center mb-4"><CheckCircle className="h-16 w-16 text-green-500" /></div>
                  <CardTitle className="font-headline text-3xl text-primary">Congratulations! You're Approved.</CardTitle>
                  <CardDescription>{assessmentResult.reason}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Please provide your bank details for fund disbursal.</p>
                  <Form {...bankForm}>
                    <form onSubmit={bankForm.handleSubmit(onBankSubmit)} className="space-y-4 text-left">
                      <FormField control={bankForm.control} name="accountNumber" render={({ field }) => (
                        <FormItem><FormLabel>Account Number (12 digits)</FormLabel><FormControl><Input placeholder="123456789012" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={bankForm.control} name="ifscCode" render={({ field }) => (
                        <FormItem><FormLabel>3-Digit Security Code</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit" disabled={isPending} className="w-full" size="lg">
                        {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                        Disburse Funds
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </AnimatedBox>
          );
        } else {
          return (
            <AnimatedBox key="rejected" className="w-full max-w-lg text-center">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
                <CardHeader>
                  <div className="flex justify-center mb-4"><XCircle className="h-16 w-16 text-destructive" /></div>
                  <CardTitle className="font-headline text-3xl text-primary">Application Update</CardTitle>
                  <CardDescription>{assessmentResult.reason}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={resetFlow} variant="outline">Start Over</Button>
                </CardContent>
              </Card>
            </AnimatedBox>
          );
        }

      case formSteps.length + 3: // Confirmation state
        return (
          <AnimatedBox key="confirmation" className="w-full max-w-lg text-center">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
              <CardHeader>
                <div className="flex justify-center mb-4"><Banknote className="h-16 w-16 text-primary" /></div>
                <CardTitle className="font-headline text-3xl text-primary">Funds Disbursed!</CardTitle>
                <CardDescription>Your loan amount has been successfully transferred and should reflect in your account shortly.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={resetFlow} variant="outline">
                  New Application
                </Button>
              </CardContent>
            </Card>
          </AnimatedBox>
        );
      
      default:
        // This case should ideally not be reached if hasStarted is handled correctly.
        return null;
    }
  };

  // Initial welcome screen logic
  if (!hasStarted) {
     return (
        <AnimatedBox key="start" className="w-full max-w-lg">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <AurumLogo />
                    </div>
                    <CardTitle className="font-headline text-3xl text-primary">Begin Your Application</CardTitle>
                    <CardDescription>Let our AI assistant find the best financing options for you.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                   <Button onClick={() => setHasStarted(true)} size="lg">
                        <ArrowRight className="mr-2 h-5 w-5" />
                        Start Application
                    </Button>
                </CardContent>
            </Card>
        </AnimatedBox>
    );
  }


  return renderContent();
}
