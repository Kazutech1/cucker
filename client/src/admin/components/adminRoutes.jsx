import Dashboard from '../components/Dashboard';
import Deposit from './Deposit';
import Products from './Products';
import SettingsPage from './Settings';
import UsersList from './UserList';
import UserManagement from './UserManagement';

import VipManagement from './Vip';
import Withdrawals from './Withdrawal';

const adminRoutes = [
  {
    path: 'dashboard',
    element: <Dashboard />,
  },
 
{
  path: 'users',
  element: <UsersList />
},
{
  path: 'users/:userId',
  element: <UserManagement />
},

  {
    path: 'deposits',
    element: <Deposit />,
  },
  {
    path: 'withdrawals',
    element: <Withdrawals />,
  },
  {
    path: 'vip',
    element: <VipManagement />,
  },
   {
    path: 'products',
    element: <Products />,
  },
  {
    path: 'settings',
    element: <SettingsPage />,
  },
];

export default adminRoutes;