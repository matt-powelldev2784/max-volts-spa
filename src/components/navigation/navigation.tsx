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
import { CirclePlus, FilePlus, FileText, LogOut, Menu, StretchHorizontal, UserPlus, UserRound } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const menuItems = [
  {
    name: 'Quote',
    requiresAuth: true,
    items: [
      { name: 'View Quotes', href: '/view-quotes', icon: FileText },
      { name: 'Add Quote', href: '/add-quote', icon: FilePlus },
    ],
  },
  {
    name: 'Client',
    requiresAuth: true,
    items: [
      {
        name: 'View Clients',
        href: '/view-clients',
        icon: UserRound,
      },
      {
        name: 'Add Client',
        href: '/add-client',
        requiresAuth: true,
        icon: UserPlus,
      },
    ],
  },
  {
    name: 'Product',
    requiresAuth: true,
    items: [
      {
        name: 'View Products',
        href: '/view-products',
        icon: StretchHorizontal,
      },
      {
        name: 'Add Product',
        href: '/add-product',
        icon: CirclePlus,
      },
    ],
  },
  {
    name: 'Log Out',
    requiresAuth: false,
    isMobileOnly: true,
    singleEntry: true,
    items: [
      {
        name: 'Log Out',
        href: '/auth/signout',
        icon: LogOut,
      },
    ],
  },
];

export const NavigationBar = () => {
  const { user } = useAuth();

  return (
    <>
      <nav
        className={`h-14 md:h-16 flex items-center mx-0 md:mx-4 relative border-b border-neutral-300 gap-2 ${user ? 'justify-between px-0 pl-4 md:px-4' : 'justify-center px-2'}`}
      >
        {/* Logo */}
        {user && (
          <a href="/" className="flex items-center h-full">
            <img src={maxVoltsLogo} alt="Max Volts Logo" className="h-8 md:h-10 md:block " />
          </a>
        )}

        {!user && (
          <a href="/" className="flex items-center">
            <img src={maxVoltsLogo} alt="Max Volts Logo" className="h-10 md:h-12" />
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
  const [openMenu, setOpenMenu] = useState<string>('');

  if (!user) return null;

  return (
    <div className="flex-row items-center gap-16 hidden md:flex">
      {menuItems.map((menuItem) => {
        if (menuItem.isMobileOnly) return null;
        const isOpen = openMenu === menuItem.name;

        return (
          <DropdownMenu
            key={menuItem.name}
            onOpenChange={(open) => (open ? setOpenMenu(menuItem.name) : setOpenMenu(''))}
          >
            <DropdownMenuTrigger>
              <p className={`text-black pb-1 border-b-2 ${isOpen ? 'border-mv-orange' : 'border-transparent'}`}>
                {menuItem.name}
              </p>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-2 min-w-max flexRow gap-2">
              {menuItem.items.map((item) => {
                const Icon = item.icon;
                return <DesktopMenuItem {...item} key={item.name} Icon={Icon} />;
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}

      <AvatarIcon />
    </div>
  );
};

type MenuItemProps = {
  name: string;
  href: string;
  Icon: React.ElementType;
};

const DesktopMenuItem = ({ name, href, Icon }: MenuItemProps) => {
  return (
    <div className="flexRow">
      <DropdownMenuItem className="cursor-pointer rounded-md px-3 py-2.5 focus:bg-mv-orange/10 flex-col items-center text-center min-w-max">
        <a href={href} className="flexCol gap-2">
          <Icon className="size-6 text-mv-orange" />
          <span className="text-lg">{name}</span>
        </a>
      </DropdownMenuItem>
    </div>
  );
};

const MobileMenu = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 mr-2 rounded">
          <Menu className="w-8 h-8 text-gray-600" />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-screen mr-4 p-0 rounded-none border-t-0 border-l-0 border-r-0">
          {menuItems.map((menuItem, menuIndex) => (
            <div key={menuItem.name}>
              {menuItem.items.map((item) => {
                const Icon = item.icon;
                return <MobileMenuItem {...item} key={item.name} Icon={Icon} />;
              })}

              {menuIndex !== menuItems.length - 1 && <DropdownMenuSeparator className="mx-4 bg-neutral-300" />}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const MobileMenuItem = ({ name, href, Icon }: MenuItemProps) => {
  return (
    <DropdownMenuItem className="cursor-pointer px-6 py-3 focus:bg-mv-orange/10 rounded-none">
      <a href={href} className="flex items-center gap-3 w-full">
        <Icon className="h-5 w-5 text-mv-orange" />
        <span className="text-lg text-gray-700">{name}</span>
      </a>
    </DropdownMenuItem>
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
              {getUserInitials(user?.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <p className="text-sm font-medium">User</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={logout} className="focus:bg-mv-orange/10 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4 text-mv-orange" />
          <span className="text-black">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavigationBar;
