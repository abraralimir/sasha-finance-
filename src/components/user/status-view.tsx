import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldX, AlertTriangle } from 'lucide-react';
import AnimatedBox from '../animated-box';

type StatusViewProps = {
  status: 'pending' | 'rejected' | 'error';
  title: string;
  message: string;
};

const statusConfig = {
  pending: {
    icon: <Loader2 className="h-12 w-12 text-primary animate-spin" />,
  },
  rejected: {
    icon: <ShieldX className="h-12 w-12 text-destructive" />,
  },
  error: {
    icon: <AlertTriangle className="h-12 w-12 text-destructive" />,
  },
};

export default function StatusView({ status, title, message }: StatusViewProps) {
  const { icon } = statusConfig[status];

  return (
    <AnimatedBox className="w-full max-w-lg">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5 text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">{icon}</div>
          <CardTitle className="font-headline text-4xl text-primary">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg">{message}</CardDescription>
        </CardContent>
      </Card>
    </AnimatedBox>
  );
}
