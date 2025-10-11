import { Outlet } from 'react-router-dom';
import maxVoltsLogo from '@/assets/max_volts_logo.svg';
import useAuth from '@/lib/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const Navigation = () => {
  const { user } = useAuth();

  const getUserInitials = (email?: string) => {
    if (!email) return '';
    return email.charAt(0).toUpperCase();
  };

  return (
    <>
      <nav className="flexBetween h-16 w-full bg-white px-10 text-mv-orange border-b-1">
        <img src={maxVoltsLogo} alt="Max Volts Logo" className="h-12" />

        <div className="flexRow gap-8 text-light-black">
          <p>Create Quote</p>
          <p>View Quotes</p>

          <Avatar>
            <AvatarImage
              src={user?.user_metadata?.avatar_url || ''}
              alt={user?.email || 'User'}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="bg-light-black text-white font-medium">
              {user?.email ? getUserInitials(user?.email) : 'X'}
            </AvatarFallback>
          </Avatar>
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navigation;
