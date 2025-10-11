import { supabase } from '@/lib/supabase';
import useAuth from '@/lib/useAuth';

const Login = () => {
  const { user } = useAuth();

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/protected` },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600">
        {user ? user.email : 'Not Logged In'}
      </h1>
      <div className="flex gap-8">
        <button className="bg-blue-500 text-white px-8 py-2" onClick={login}>
          Login
        </button>

        <button className="bg-blue-500 text-white px-8 py-2" onClick={logout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Login;
