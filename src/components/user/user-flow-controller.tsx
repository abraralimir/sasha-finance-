'use client';

import { useState, useTransition } from 'react';
import type { User } from '@/lib/types';
import { loginUser } from '@/lib/actions';
import HomeDashboard from './home-dashboard';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AnimatedBox from '../animated-box';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { KeyRound, Loader2, LogIn } from 'lucide-react';
import AurumLogo from '../aurum-logo';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, Auth } from 'firebase/auth';

const loginSchema = z.object({
  fullName: z.string().min(1, 'Please enter your full name.'),
  secretKey: z.string().min(1, 'Please enter your secret key.'),
});

// This is a client-side helper function
async function ensureAuthUser(auth: Auth, user: User) {
  try {
    // Try to sign in first
    await signInWithEmailAndPassword(auth, user.email, user.secretKey);
  } catch (error: any) {
    // If user not found in Auth, create them. This handles cases where user exists in DB but not Auth.
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        await createUserWithEmailAndPassword(auth, user.email, user.secretKey);
        // After creation, sign in again to establish the session
        await signInWithEmailAndPassword(auth, user.email, user.secretKey);
      } catch (creationError: any) {
        // This might fail if another process created the user in a race condition.
        // One last sign-in attempt can resolve this.
        if (creationError.code === 'auth/email-already-exists') {
          await signInWithEmailAndPassword(auth, user.email, user.secretKey);
        } else {
          // If it's a different error, re-throw it.
          throw creationError;
        }
      }
    } else {
      // If it's another type of auth error (e.g., wrong password), re-throw it.
      throw error;
    }
  }
}


export default function UserFlowController() {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const auth = useAuth(); // This is the client-side auth instance

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      fullName: '',
      secretKey: '',
    },
  });

  const handleLogin = (values: z.infer<typeof loginSchema>) => {
    startTransition(async () => {
      try {
        // Step 1: Call the server action to verify credentials against the database.
        const loggedInUser = await loginUser(values);

        if (loggedInUser && loggedInUser.email) {
          // Step 2: On the client, ensure the user is signed into Firebase Auth.
          await ensureAuthUser(auth, loggedInUser);
          // Step 3: Set the user state to render the dashboard.
          setUser(loggedInUser);
        } else {
          toast({
            title: 'Login Failed',
            description: 'Invalid name or secret key. Please try again.',
            variant: 'destructive',
          });
          form.reset(); // Clear form on failure
        }
      } catch (error) {
        console.error("Login process failed:", error);
        toast({
          title: 'Login Error',
          description: error instanceof Error ? error.message : 'An unknown error occurred during login.',
          variant: 'destructive',
        });
        form.reset(); // Clear form on failure
      }
    });
  };
  
  const handleUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (user) {
    return <HomeDashboard user={user} onUpdate={handleUpdate} />;
  }

  return (
    <AnimatedBox className="w-full max-w-md">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <AurumLogo />
            </div>
          <CardTitle className="font-headline text-3xl text-primary">
            Welcome to Aurum Finance
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your secure financing portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Legal Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} disabled={isPending} />
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
                            <Input type="password" placeholder="••••••••" {...field} disabled={isPending} className="pl-10" />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full" size="lg">
                {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                Secure Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AnimatedBox>
  );
}
