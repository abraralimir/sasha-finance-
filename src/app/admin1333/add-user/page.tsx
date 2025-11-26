'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { onboardNewUser } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, UserPlus, CheckCircle, Upload, Camera, AlertTriangle } from 'lucide-react';
import AnimatedBox from '@/components/animated-box';
import MainHeader from '@/components/main-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
});

export default function AddUserPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
    },
  });

  useEffect(() => {
    const getCameraPermission = async () => {
      // Only request permission if it hasn't been determined yet
      if (hasCameraPermission === null) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
        }
      }
    };
    getCameraPermission();

    // Cleanup function to stop the camera stream
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [hasCameraPermission]);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUri(reader.result as string);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCapture = () => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUri = canvas.toDataURL('image/jpeg');
            setImageDataUri(dataUri);
            setFileName('capture.jpg');
        }
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!imageDataUri) {
      toast({
        title: 'Image Required',
        description: 'Please upload or capture a photo for the user.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        await onboardNewUser({ fullName: values.fullName, photoUrl: imageDataUri });
        toast({
          title: 'User Onboarded',
          description: `${values.fullName} has been added and can now proceed with verification.`,
        });
        form.reset();
        setImageDataUri(null);
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
              <CardDescription>
                Add a new user by providing their full name and a reference photo for verification.
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

                  <FormItem>
                    <FormLabel>Reference Photo</FormLabel>
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">
                          <Upload className="mr-2" /> Upload
                        </TabsTrigger>
                        <TabsTrigger value="camera">
                          <Camera className="mr-2" /> Use Camera
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="mt-4">
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
                              className="flex items-center justify-center w-full h-48 border-2 border-dashed border-input rounded-md cursor-pointer hover:bg-accent"
                            >
                                <div className="text-center text-muted-foreground">
                                  <Upload className="mx-auto h-8 w-8 mb-2" />
                                  <p>Click to upload a photo</p>
                                  <p className="text-xs">PNG, JPG, etc.</p>
                                </div>
                            </label>
                          </div>
                        </FormControl>
                      </TabsContent>
                      <TabsContent value="camera" className="mt-4">
                        {hasCameraPermission === false && (
                             <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Camera Access Denied</AlertTitle>
                                <AlertDescription>
                                    Please enable camera permissions in your browser settings.
                                </AlertDescription>
                            </Alert>
                        )}
                        {hasCameraPermission && (
                            <div className="flex flex-col items-center gap-4">
                                <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                                <Button type="button" onClick={handleCapture}>
                                    <Camera className="mr-2" /> Capture Photo
                                </Button>
                            </div>
                        )}
                      </TabsContent>
                    </Tabs>
                    {(fileName || imageDataUri) && (
                      <div className="mt-4 flex items-center gap-4 p-2 border rounded-md bg-accent/50">
                        <Image src={imageDataUri!} alt="Preview" width={64} height={64} className="rounded-md w-16 h-16 object-cover" />
                        <div className="flex-grow">
                            <p className="text-sm font-medium">{fileName || 'Captured Image'}</p>
                            <p className="text-xs text-muted-foreground">Image ready for onboarding</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { setImageDataUri(null); setFileName(''); }}>
                          Remove
                        </Button>
                      </div>
                    )}
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
