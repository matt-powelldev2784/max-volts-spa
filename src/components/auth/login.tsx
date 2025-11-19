import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@//ui/card';
import { Button } from '@//ui/button';
import { ArrowLeft, Mail } from 'lucide-react';
import maxVoltsIcon from '@/assets/max_volts_icon.svg';
import googleGIcon from '@/assets/google_g_logo.svg';
import { useNavigate } from 'react-router';

type CurrentView = 'main' | 'signInWithEmail' | 'signUpWithEmail';

const Login = () => {
  const [currentView, setCurrentView] = useState<CurrentView>('main');

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-[400px] border-2 border-gray-200 shadow-lg">
        {currentView === 'main' && <MainView setCurrentView={setCurrentView} />}
        {currentView === 'signInWithEmail' && <SignInWithEmail setCurrentView={setCurrentView} />}
        {currentView === 'signUpWithEmail' && <SignUpWithEmail setCurrentView={setCurrentView} />}
      </Card>
    </div>
  );
};

type MainViewProps = {
  setCurrentView: (view: CurrentView) => void;
};

const MainView = ({ setCurrentView }: MainViewProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/view-quotes` },
    });
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@test.com',
      password: 'demo123456',
    });

    if (error) {
      console.error('Demo sign-in error:', error);
      setIsLoading(false);
      return;
    }

    navigate('/view-quotes');
  };

  return (
    <>
      <CardHeader className="rounded-t-x">
        <img src={maxVoltsIcon} alt="Max Volts Logo" className="mx-auto h-12" />
        <CardTitle className="text-center text-2xl">Sign In</CardTitle>
      </CardHeader>

      <CardDescription className="px-4 text-center">Welcome to Max Volts Quotation System</CardDescription>

      <p className="px-6 pt-4 text-center text-gray-600">
        To demo this project, click the <span className="font-bold text-mv-orange cursor-pointer">Demo Sign In</span>{' '}
        button. This will use a demo account.
      </p>

      <CardContent className="space-y-4 px-6 pb-6 pt-4">
        {/* Demo Sign In Button */}
        <Button
          className="w-full bg-mv-orange text-white font-semibold"
          size="lg"
          onClick={handleDemoSignIn}
          isLoading={isLoading}
        >
          Demo Sign In
        </Button>

        {/* Email Sign In Button */}
        <Button
          className="w-full border-2 border-gray-300 bg-white text-gray-900 font-semibold"
          size="lg"
          onClick={() => setCurrentView('signInWithEmail')}
          isLoading={isLoading}
        >
          <Mail className="mr-2 h-5 w-5" />
          Sign in with Email
        </Button>

        {/* Google Sign In Button */}
        <Button
          className="w-full border-2 border-gray-300 bg-white text-gray-900 font-semibold"
          size="lg"
          onClick={handleGoogleSignIn}
          isLoading={isLoading}
        >
          <img src={googleGIcon} alt="Google Icon" className="h-6" />
          Sign in with Google
        </Button>

        {/* Create Account Link */}
        <p className="text-center text-sm text-gray-600 pt-4">
          Don't have an account?{' '}
          <button
            className="font-bold text-mv-orange cursor-pointer hover:underline"
            onClick={() => setCurrentView('signUpWithEmail')}
          >
            Create one
          </button>
        </p>
      </CardContent>
    </>
  );
};

const signInFormSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type SignInFormData = z.infer<typeof signInFormSchema>;

const SignInWithEmail = ({ setCurrentView }: MainViewProps) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: SignInFormData) => {
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email.trim(),
      password: data.password.trim(),
    });

    if (signInError) {
      setError('Invalid email or password. Please try again.');
      return;
    }

    navigate('/view-quotes');
  };

  return (
    <>
      <CardHeader className="rounded-t-xl">
        <Mail className="mx-auto h-8 w-8 text-mv-orange" />
        <CardTitle className="text-center text-2xl">Sign In With Email</CardTitle>
      </CardHeader>

      <CardDescription className="relative px-6 text-center pb-4">
        Enter your credentials to sign in
        {error && <p className="absolute px-6 pt-4 text-center text-sm text-red-600 -bottom-2">{error}</p>}
      </CardDescription>

      <CardContent className="px-6 pb-6 pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative pb-2">
            <label className="text-sm font-medium text-gray-900" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              id="email"
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-mv-orange focus:outline-none focus:ring-2 focus:ring-mv-orange/20 ${errors.email ? 'border-red-600' : ''}`}
            />
            {errors.email && <p className="absolute text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="relative pb-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-900">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              id="password"
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-mv-orange focus:outline-none focus:ring-2 focus:ring-mv-orange/20 ${errors.password ? 'border-red-600' : ''}`}
            />
            {errors.password && <p className="absolute text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="flexCol gap-2 pt-4">
            <Button
              type="submit"
              className="w-full bg-mv-orange text-white font-semibold"
              size="lg"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full border-gray-300 text-gray-700 font-medium"
              onClick={() => setCurrentView('main')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in options
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
};

const signUpFormSchema = z
  .object({
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpFormSchema>;

const SignUpWithEmail = ({ setCurrentView }: MainViewProps) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: SignUpFormData) => {
    setError('');

    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    navigate('/view-quotes');
  };

  return (
    <>
      <CardHeader className="rounded-t-xl">
        <Mail className="mx-auto h-8 w-8 text-mv-orange" />
        <CardTitle className="text-center text-2xl">Create Account</CardTitle>
      </CardHeader>

      <CardDescription className="relative px-6 text-center pb-4">
        Enter email and password to create your account
        {error && <p className="absolute px-6 pt-4 text-center text-sm text-red-600 -bottom-2">{error}</p>}
      </CardDescription>

      <CardContent className="px-6 pb-6 pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative pb-2">
            <label className="text-sm font-medium text-gray-900">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-mv-orange focus:outline-none focus:ring-2 focus:ring-mv-orange/20 ${errors.email ? 'border-red-600' : ''}`}
            />
            {errors.email && <p className="absolute text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="relative pb-2">
            <label className="text-sm font-medium text-gray-900">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-mv-orange focus:outline-none focus:ring-2 focus:ring-mv-orange/20 ${errors.password ? 'border-red-600' : ''}`}
            />
            {errors.password && <p className="absolute text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="relative pb-2">
            <label className="text-sm font-medium text-gray-900">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              {...register('confirmPassword')}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-mv-orange focus:outline-none focus:ring-2 focus:ring-mv-orange/20 ${errors.confirmPassword ? 'border-red-600' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="absolute text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flexCol gap-2 pt-4">
            <Button
              type="submit"
              className="w-full bg-mv-orange text-white font-semibold"
              size="lg"
              isLoading={isSubmitting}
            >
              Create Account
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full border-gray-300 text-gray-700 font-medium"
              onClick={() => setCurrentView('main')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in options
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
};

export default Login;
