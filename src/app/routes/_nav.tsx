import NavigationBar from '@/components/navigation/navigation';
import { Outlet } from 'react-router';
const NavigationBarPage = () => {
  return (
    <>
      <NavigationBar />
      <Outlet />
    </>
  );
};

export default NavigationBarPage;
