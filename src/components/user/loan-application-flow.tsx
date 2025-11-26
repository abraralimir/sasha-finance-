'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { submitLoanApplication } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight, Banknote, ShieldCheck, Send, CheckCircle, XCircle } from 'lucide-react';
import AnimatedBox from '@/components/animated-box';
import AurumLogo from '../aurum-logo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const step1Schema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  loanAmount: z.coerce.number().min(1000, 'Loan amount must be at least $1,000.'),
  creditScore: z.coerce.number().min(300, 'Credit score must be at least 300.').max(850, 'Credit score cannot exceed 850.'),
  annualIncome: z.coerce.number().min(10000, 'Annual income must be at least $10,000.'),
  employmentStatus: z.enum(['employed', 'self-employed', 'student', 'unemployed']),
});

const step2Schema = z.object({
    accountNumber: z.string().length(12, 'Account number must be 12 digits.'),
    ifscCode: z.string().length(3, 'Code must be 3 digits.'),
});


export default function LoanApplicationFlow() {
    const [step, setStep] = useState(1);
    const [isPending, startTransition] = useTransition();
    const [assessmentResult, setAssessmentResult] = useState<{isEligible: boolean, reason: string} | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof step1Schema>>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            fullName: '',
            loanAmount: 50000,
            creditScore: 650,
            annualIncome: 70000,
            employmentStatus: 'employed',
        },
    });

    const bankForm = useForm<z.infer<typeof step2Schema>>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            accountNumber: '',
            ifscCode: '',
        },
    });

    const onFinancialSubmit = (values: z.infer<typeof step1Schema>) => {
        startTransition(async () => {
            try {
                const { eligibility } = await submitLoanApplication(values);
                setAssessmentResult(eligibility);
                setStep(2); 
            } catch (error) {
                toast({
                title: 'Submission Failed',
                description: error instanceof Error ? error.message : 'An unknown error occurred.',
                variant: 'destructive',
                });
            }
        });
    };

    const onBankSubmit = (values: z.infer<typeof step2Schema>) => {
        startTransition(() => {
            // Simulate payment processing
            setTimeout(() => {
                setStep(3); // Move to final confirmation step
            }, 1500)
        });
    }


    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <AnimatedBox key="step1" className="w-full max-w-lg">
                    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <AurumLogo />
                            </div>
                            <CardTitle className="font-headline text-3xl text-primary">Begin Your Application</CardTitle>
                            <CardDescription>Let our AI assistant find the best financing options for you.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onFinancialSubmit)} className="space-y-4">
                                <FormField control={form.control} name="fullName" render={({ field }) => (
                                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="loanAmount" render={({ field }) => (
                                    <FormItem><FormLabel>Loan Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="creditScore" render={({ field }) => (
                                    <FormItem><FormLabel>Credit Score</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="annualIncome" render={({ field }) => (
                                    <FormItem><FormLabel>Annual Income</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="employmentStatus" render={({ field }) => (
                                    <FormItem><FormLabel>Employment Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="employed">Employed</SelectItem>
                                            <SelectItem value="self-employed">Self-Employed</SelectItem>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="unemployed">Unemployed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage /></FormItem>
                                )}/>
                                <Button type="submit" disabled={isPending} className="w-full" size="lg">
                                    {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                                    Assess Eligibility
                                </Button>
                            </form>
                        </Form>
                        </CardContent>
                    </Card>
                    </AnimatedBox>
                );
            case 2:
                if (!assessmentResult) return null; // Should not happen
                if (assessmentResult.isEligible) {
                    return (
                        <AnimatedBox key="step2-approved" className="w-full max-w-lg text-center">
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
                                            )}/>
                                            <FormField control={bankForm.control} name="ifscCode" render={({ field }) => (
                                                <FormItem><FormLabel>3-Digit Security Code</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <Button type="submit" disabled={isPending} className="w-full" size="lg">
                                                {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                                                Disburse Funds
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </AnimatedBox>
                    )
                } else {
                     return (
                        <AnimatedBox key="step2-rejected" className="w-full max-w-lg text-center">
                            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
                                <CardHeader>
                                    <div className="flex justify-center mb-4"><XCircle className="h-16 w-16 text-destructive" /></div>
                                    <CardTitle className="font-headline text-3xl text-primary">Application Update</CardTitle>
                                    <CardDescription>{assessmentResult.reason}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={() => setStep(1)} variant="outline">Start Over</Button>
                                </CardContent>
                            </Card>
                        </AnimatedBox>
                     )
                }
            case 3:
                return (
                    <AnimatedBox key="step3" className="w-full max-w-lg text-center">
                         <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
                            <CardHeader>
                                <div className="flex justify-center mb-4"><Banknote className="h-16 w-16 text-primary" /></div>
                                <CardTitle className="font-headline text-3xl text-primary">Funds Disbursed!</CardTitle>
                                <CardDescription>Your loan amount has been successfully transferred and should reflect in your account shortly.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={() => { setStep(1); form.reset(); bankForm.reset(); setAssessmentResult(null); }} variant="outline">
                                    New Application
                                </Button>
                            </CardContent>
                        </Card>
                    </AnimatedBox>
                )
            default:
                return null;
        }
    }

    return renderStep();
}