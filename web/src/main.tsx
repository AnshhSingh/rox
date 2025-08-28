import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import StoresPage from './pages/Stores';
import AdminDashboard from './pages/admin/Dashboard';
import UsersList from './pages/admin/UsersList';
import UserDetails from './pages/admin/UserDetails';
import StoresAdmin from './pages/admin/StoresAdmin';
import OwnerDashboard from './pages/owner/Dashboard';
import ChangePassword from './pages/ChangePassword';
import { AuthProvider } from './state/auth';
import Nav from './pages/_layout/Nav';
import './styles.css';
import RequireRole from './components/RequireRole';

const router = createBrowserRouter([
  { path: '/', element: <Nav><StoresPage /></Nav> },
  { path: '/login', element: <Nav><LoginPage /></Nav> },
  { path: '/signup', element: <Nav><SignupPage /></Nav> },
  { path: '/change-password', element: <Nav><ChangePassword /></Nav> },
  { path: '/admin', element: <Nav><RequireRole roles={['ADMIN']}><AdminDashboard /></RequireRole></Nav> },
  { path: '/admin/users', element: <Nav><RequireRole roles={['ADMIN']}><UsersList /></RequireRole></Nav> },
  { path: '/admin/stores', element: <Nav><RequireRole roles={['ADMIN']}><StoresAdmin /></RequireRole></Nav> },
  { path: '/admin/users/:id', element: <Nav><RequireRole roles={['ADMIN']}><UserDetails /></RequireRole></Nav> },
  { path: '/owner', element: <Nav><RequireRole roles={['OWNER']}><OwnerDashboard /></RequireRole></Nav> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <MantineProvider defaultColorScheme="light">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MantineProvider>
  </React.StrictMode>
);
