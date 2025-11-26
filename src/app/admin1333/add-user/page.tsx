'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { onboardNewUser } from '@/lib/actions';
import type { User } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, CheckCircle, Upload } from 'lucide-react';
import AnimatedBox from '@/components/animated-box';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import MainHeader from '@/components/main-header';

const formSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
});

export default function AddUserPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!uploadedImage) {
        toast({
            title: 'Image Required',
            description: 'Please upload a photo for the user.',
            variant: 'destructive',
        });
        return;
    }
    
    startTransition(async () => {
      try {
        await onboardNewUser({ fullName: values.fullName, photoUrl: uploadedImage });
        toast({
          title: 'User Onboarded',
          description: `${values.fullName} has been added and can now proceed with verification.`,
        });
        form.reset();
        setUploadedImage(null);
        setFileName('');
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
              <CardDescription>Add a new user by providing their full name and a reference photo for verification.</CardDescription>
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
                  
                  <FormItem>
                    <FormLabel>Reference Photo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-md cursor-pointer hover:bg-accent"
                        >
                          {uploadedImage ? (
                            <div className="relative w-24 h-24">
                                <Image src={uploadedImage} alt="Uploaded photo" layout="fill" objectFit="cover" className="rounded-md" />
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <Upload className="mx-auto h-8 w-8 mb-2" />
                              <p>Click to upload a photo</p>
                              <p className="text-xs">PNG, JPG, etc.</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </FormControl>
                    {fileName && <p className="text-sm text-muted-foreground mt-2">{fileName}</p>}
                    <FormMessage />
                  </FormItem>

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
