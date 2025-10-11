import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom';
import useAuth from '@/lib/useAuth';
import Protected from '@/components/protected/protected';
import Login from '@/components/auth/login';
import { NavigationBar } from '@/components/navigation/navigation';

const ProtectedLayouts = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <></>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<NavigationBar />}>
          <Route path="/" element={<Login />} />
        </Route>

        <Route element={<ProtectedLayouts />}>
          <Route path="/protected" element={<Protected />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;