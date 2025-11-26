'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { submitKyc } from '@/lib/actions';
import type { User } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, FileCheck2, Loader2, UserCheck, CheckCircle } from 'lucide-react';
import AnimatedBox from '../animated-box';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  documentNumber: z.string().min(5, 'Document number seems too short.'),
});

type KycFlowProps = {
  onKycSuccess: (user: User) => void;
};

export default function KycFlow({ onKycSuccess }: KycFlowProps) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      documentNumber: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        const updatedUser = await submitKyc(values);
        onKycSuccess(updatedUser);
        toast({
          title: 'KYC Submitted',
          description: 'Your information is now being verified.',
        });
      } catch (error) {
        toast({
          title: 'Submission Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    });
  };

  const docImage = PlaceHolderImages.find(img => img.id === 'doc-scan')!;
  const faceImage = PlaceHolderImages.find(img => img.id === 'face-scan')!;

  const steps = [
    // Welcome Step
    <AnimatedBox key={0} className="w-full max-w-lg text-center">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-primary">Welcome to Aurum</CardTitle>
          <CardDescription>Secure, Swift, Superior Financing.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">To begin, we need to verify your identity. This is a quick and secure process powered by AI.</p>
          <Button onClick={() => setStep(1)} size="lg">
            Start Verification <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </AnimatedBox>,

    // Form Step
    <AnimatedBox key={1} className="w-full max-w-lg">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center gap-2">
            <UserCheck /> Personal Information
          </CardTitle>
          <CardDescription>Please enter your details exactly as they appear on your document.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={() => setStep(2)} className="space-y-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Legal Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Johnathan Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Number</FormLabel>
                    <FormControl>
                      <Input placeholder="C12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" onClick={form.handleSubmit(() => setStep(2))} className="w-full" size="lg">
                Next <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AnimatedBox>,

    // Upload simulation step
    <AnimatedBox key={2} className="w-full max-w-lg">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center gap-2">
            <FileCheck2 /> Document & Face Scan
          </CardTitle>
          <CardDescription>For the purpose of this demo, we'll use placeholder images for your document and face scan.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                    <Image src={docImage.imageUrl} alt={docImage.description} width={200} height={125} className="rounded-lg mx-auto border-2 border-primary/20" data-ai-hint={docImage.imageHint} />
                    <p className="text-sm text-muted-foreground mt-2">Document Image</p>
                </div>
                 <div className="text-center">
                    <Image src={faceImage.imageUrl} alt={faceImage.description} width={125} height={125} className="rounded-full mx-auto border-2 border-primary/20" data-ai-hint={faceImage.imageHint} />
                    <p className="text-sm text-muted-foreground mt-2">Face Scan</p>
                </div>
            </div>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending} className="w-full" size="lg">
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-5 w-5" />
            )}
            Submit for Verification
          </Button>
        </CardContent>
      </Card>
    </AnimatedBox>
  ];

  return <div className="animate-fade-in">{steps[step]}</div>;
}
