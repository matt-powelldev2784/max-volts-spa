import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom';
import useAuth from '@/lib/useAuth';
import Login from '@/components/auth/login';
import { NavigationBar } from '@/components/navigation/navigation';
import ViewQuotes from '@/components/viewQuotes/viewQuotes';
import AddQuote from '@/components/addQuote/addQuote';
import SignOut from '@/components/auth/signOut';

const ProtectedLayouts = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <NavigationBar />;
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

        <Route element={<NavigationBar />}>
          <Route element={<ProtectedLayouts />}>
            <Route path="/view-quotes" element={<ViewQuotes />} />
            <Route path="/add-quote" element={<AddQuote />} />
            <Route path="/auth/signout" element={<SignOut />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;