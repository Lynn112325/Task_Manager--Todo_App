import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createHashRouter, RouterProvider } from "react-router";
import { Navigate, Outlet } from 'react-router-dom';
import DashboardLayout from "./components/DashboardLayout";
import { useAuth, UserProvider } from "./context/UserContext";
import DialogsProvider from "./hooks/useDialogs/DialogsProvider";
import NotificationsProvider from "./hooks/useNotifications/NotificationsProvider";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import SignUpPage from "./pages/SignUpPage";
import TargetDetail from './pages/TargetDetail';
import TaskCreate from "./pages/TaskCreate";
import TaskEdit from "./pages/TaskEdit";
import TaskList from "./pages/TaskList";
import TaskShow from "./pages/TaskShow";
import AppTheme from "./shared-theme/AppTheme";
import {
  dataGridCustomizations,
  datePickersCustomizations,
  formInputCustomizations,
  sidebarCustomizations,
} from "./theme/customizations";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
    },
  },
});

const router = createHashRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/tasks/todo",
        element: <TaskList />,
      },
      {
        path: "/tasks/:taskId",
        element: <TaskShow />,
      },
      {
        path: "/tasks/new",
        element: <TaskCreate />,
      },
      {
        path: "/tasks/:taskId/edit",
        element: <TaskEdit />,
      },
      {
        path: 'targets/:targetId',
        element: <TargetDetail />,
      },
      // Fallback route for the example routes in dashboard sidebar items
      {
        path: "*",
        element: <TaskList />,
      },
    ],
  },
]);
const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

export default function App(props) {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <AppTheme {...props} themeComponents={themeComponents}>
          <CssBaseline enableColorScheme />
          <NotificationsProvider>
            <DialogsProvider>
              <RouterProvider router={router} />
            </DialogsProvider>
          </NotificationsProvider>
        </AppTheme>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </UserProvider>
  );
}
