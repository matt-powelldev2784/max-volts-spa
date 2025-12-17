import {
  CirclePlus,
  FilePlus,
  FileSpreadsheet,
  FileText,
  LogOut,
  StretchHorizontal,
  UserPlus,
  UserRound,
} from 'lucide-react';

export const menuItems = [
  {
    name: 'Quote',
    items: [
      { name: 'View Quotes', href: '/view-quotes', icon: FileText },
      { name: 'Add Quote', href: '/add-quote', icon: FilePlus },
    ],
  },
  {
    name: 'Invoice',
    items: [{ name: 'View Invoices', href: '/view-invoices', icon: FileSpreadsheet }],
  },
  {
    name: 'Client',
    items: [
      {
        name: 'View Clients',
        href: '/view-clients',
        icon: UserRound,
      },
      {
        name: 'Add Client',
        href: '/add-client',
        icon: UserPlus,
      },
    ],
  },
  {
    name: 'Product',
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
    isMobileOnly: true,
    items: [
      {
        name: 'Log Out',
        href: '/login',
        icon: LogOut,
      },
    ],
  },
];
