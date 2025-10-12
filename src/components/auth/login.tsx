import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';
import maxVoltsIcon from '@/assets/max_volts_icon.svg';
import googleGIcon from '@/assets/google_g_logo.svg';
import useAuth from '@/lib/useAuth';
import { useNavigate } from 'react-router-dom';

type CurrentView = 'main' | 'signInWithEmail' | 'signUpWithEmail';

const Login = () => {
  const [currentView, setCurrentView] = useState<CurrentView>('main');
  const { user } = useAuth();
  console.log('user', user);

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
        To demo this project, click the{' '}
        <span className="font-bold text-mv-orange cursor-pointer">Demo Sign In</span> button. This will use a
        demo account.
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
          <span
            className="font-bold text-mv-orange cursor-pointer hover:underline"
            onClick={() => setCurrentView('signUpWithEmail')}
          >
            Create one
          </span>
        </p>
      </CardContent>
    </>
  );
};

const SignInWithEmail = ({ setCurrentView }: MainViewProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
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

      <CardDescription className="px-6 text-center">Enter your credentials to sign in</CardDescription>

      {error && <p className="px-6 pt-4 text-center text-sm text-red-600">{error}</p>}

      <CardContent className="px-6 pb-6 pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-mv-orange focus:outline-none focus:ring-2 focus:ring-mv-orange/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-mv-orange focus:outline-none focus:ring-2 focus:ring-mv-orange/20"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-mv-orange text-white font-semibold"
            size="lg"
            isLoading={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
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
        </form>
      </CardContent>
    </>
  );
};

const SignUpWithEmail = ({ setCurrentView }: MainViewProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
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

      <CardDescription className="px-6 text-center">
        Enter email and password to create your account
      </CardDescription>

      {error && <p className="px-6 pt-4 text-center text-sm text-red-600">{error}</p>}

      <CardContent className="px-6 pb-6 pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-mv-orange focus:outline-none focus:ring-2 focus:ring-mv-orange/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-mv-orange focus:outline-none focus:ring-2 focus:ring-mv-orange/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-mv-orange focus:outline-none focus:ring-2 focus:ring-mv-orange/20"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-mv-orange text-white font-semibold"
            size="lg"
            isLoading={isLoading}
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
        </form>
      </CardContent>
    </>
  );
};

export default Login;
