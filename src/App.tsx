import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom';
import useAuth from './lib/useAuth';
import Protected from './components/protected/protected';
import Login from './components/auth/login';

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
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedLayouts />}>
          <Route path="/protected" element={<Protected />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;