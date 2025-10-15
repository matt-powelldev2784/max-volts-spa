import { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@//ui/card';
import { Button } from '@//ui/button';
import { ArrowLeft } from 'lucide-react';
import maxVoltsIcon from '@/assets/max_volts_icon.svg';
import useAuth from '@/lib/useAuth';

const SignOut = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      setIsLoading(false);
      return;
    }

    return navigate('/', { replace: true });
  };

  const handleCancel = () => {
    navigate('/view-quotes');
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-[400px] border-2 border-gray-200 shadow-lg">
        <CardHeader className="rounded-t-xl">
          <img src={maxVoltsIcon} alt="Max Volts Logo" className="mx-auto h-12" />
          <CardTitle className="text-center text-2xl">Sign Out</CardTitle>
        </CardHeader>

        <CardDescription className="px-6 text-center">Are you sure you want to sign out?</CardDescription>

        {user && (
          <p className="px-6 pt-4 text-center text-sm text-gray-600">
            You are currently signed in as <span className="font-bold text-mv-orange">{user.email}</span>
          </p>
        )}

        <CardContent className="space-y-4 px-6 pb-6 pt-6">
          <Button
            className="w-full bg-mv-orange text-white font-semibold"
            size="lg"
            onClick={handleSignOut}
            isLoading={isLoading}
          >
            Sign Out
          </Button>

          <Button
            variant="ghost"
            className="w-full border-gray-300 text-gray-700 font-medium"
            size="lg"
            onClick={handleCancel}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignOut;
