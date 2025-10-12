import { Outlet } from 'react-router-dom';
import maxVoltsLogo from '@/assets/max_volts_logo.svg';
import useAuth from '@/lib/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

const navigationLinks = [
  {
    name: 'View Quotes',
    href: '/view-jobs',
    requiresAuth: true,
  },
  { name: 'Add Quote', href: '/add-job', requiresAuth: true },
  {
    name: 'Log Out',
    href: '/auth/sign-out',
    requiresAuth: false,
    isMobileOnly: true,
  },
];

export const NavigationBar = () => {
  const { user } = useAuth();

  return (
    <>
      <nav
        className={`h-14 md:h-16 flex items-center mx-0 md:mx-4 relative border-b border-gray-300 gap-2 ${user ? 'justify-between px-0 pl-4 md:px-4' : 'justify-center px-2'}`}
      >
        {/* Logo */}
        {user && (
          <a href="/" className="flex items-center gap-2 h-full">
            <img
              src={maxVoltsLogo}
              alt="Max Volts Logo"
              className="h-8 md:h-9 md:block "
            />
          </a>
        )}

        {!user && (
          <a href="/" className="flex items-center">
            <img
              src={maxVoltsLogo}
              alt="Max Volts Logo"
              className="h-10 md:h-12"
            />
          </a>
        )}

        {/* Desktop Menu */}
        <DesktopMenu />

        {/* Mobile Burger Menu */}
        <MobileMenu />
      </nav>

      <Outlet />
    </>
  );
};

const DesktopMenu = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-row items-center gap-10">
      {navigationLinks.map((link) => {
        if (link.requiresAuth && !user) return null;
        if (link.isMobileOnly) return null;

        return (
          <a
            key={link.name}
            href={link.href}
            className="hidden md:flex items-center gap-2 text-darkGrey w-fit h-full"
          >
            {link.name}
          </a>
        );
      })}

      {<AvatarIcon />}
    </div>
  );
};

const MobileMenu = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!menuIsOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuIsOpen]);

  if (!user) return null;

  return (
    <div className="md:hidden mr-2" ref={menuRef}>
      <button
        aria-label="Open menu"
        className="p-2 rounded focus:outline-none"
        onClick={() => setMenuIsOpen((prev) => !prev)}
      >
        <Menu className="w-8 h-8 text-darkGrey" />
      </button>

      {menuIsOpen && (
        <div className="absolute right-0 top-14 z-50 bg-white shadow-lg rounded flex flex-col w-screen">
          {navigationLinks.map((link) => {
            if (link.requiresAuth && !user) return null;

            return (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center gap-2 px-4 py-4 text-darkGrey hover:bg-muted border-b border-r border-darkGrey"
                onClick={() => setMenuIsOpen(false)}
              >
                {link.name}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AvatarIcon = () => {
  const { user } = useAuth();

  const getUserInitials = (email?: string) => {
    if (!email) return '';
    return email.charAt(0).toUpperCase();
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hidden md:block rounded-full focus:outline-none focus:ring-2 focus:ring-[--color-mv-orange]">
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
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <p className="text-sm font-medium">
            {user?.user_metadata?.full_name || 'User'}
          </p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavigationBar;
