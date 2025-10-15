import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
import { AlertCircle } from 'lucide-react';
import { LinkButton } from '@/ui/button';

type ErrorCardProps = {
  title?: string;
  message: string;
};

const ErrorCard = ({ title = 'Server Error', message }: ErrorCardProps) => {
  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-[400px] border-2 border-gray-200 shadow-lg">
        <CardHeader className="flexCol">
          <AlertCircle className="h-16 w-16 text-red-500" />
          <CardTitle className="text-center text-2xl">{title}</CardTitle>
        </CardHeader>

        <CardContent className="flexCol gap-4">
          <CardDescription className="text-center text-gray-700 text-base">{message}</CardDescription>

          <p></p>
          <LinkButton variant="default" size="lg" to="/view-quotes">
            Go to home page
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorCard;
