'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { onboardNewUser } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, CheckCircle, KeyRound } from 'lucide-react';
import AnimatedBox from '@/components/animated-box';
import MainHeader from '@/components/main-header';

const formSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  secretKey: z.string().min(4, 'Secret key must be at least 4 characters.'),
});

export default function AddUserPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const auth = useAuth();

  useEffect(() => {
    // Ensure admin is signed in anonymously to have permission to write to Firestore
    if (auth && !auth.currentUser) {
      signInAnonymously(auth).catch((error) => {
        console.error("Anonymous sign-in failed", error);
        toast({
          title: 'Authentication Error',
          description: 'Could not authenticate admin session. Please refresh the page.',
          variant: 'destructive'
        });
      });
    }
  }, [auth, toast]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      secretKey: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        await onboardNewUser({ fullName: values.fullName, secretKey: values.secretKey });
        toast({
          title: 'User Onboarded',
          description: `${values.fullName} has been added and can now log in.`,
        });
        form.reset();
      } catch (error) {
        toast({
          title: 'Onboarding Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainHeader />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <AnimatedBox className="w-full max-w-lg">
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="font-headline text-3xl text-primary flex items-center gap-2">
                <UserPlus /> Onboard New User
              </CardTitle>
              <CardDescription>
                Add a new user by providing their full name and a secret key for login.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Legal Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secretKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secret Key</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isPending} className="w-full" size="lg">
                    {isPending ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-5 w-5" />
                    )}
                    Onboard User
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </AnimatedBox>
      </main>
    </div>
  );
}
