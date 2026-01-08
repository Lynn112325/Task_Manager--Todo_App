import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import CssBaseline from "@mui/material/CssBaseline";
import { createHashRouter, RouterProvider } from "react-router";
import { Navigate, Outlet } from 'react-router-dom';
import DashboardLayout from "./components/DashboardLayout";
import { useAuth, UserProvider } from "./context/UserContext";
import DialogsProvider from "./hooks/useDialogs/DialogsProvider";
import NotificationsProvider from "./hooks/useNotifications/NotificationsProvider";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import SignUpPage from "./pages/SignUpPage";
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

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const router = createHashRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignUpPage,
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
  {
    element: <ProtectedRoute />,
    Component: DashboardLayout,
    children: [
      {
        path: "/tasks/todo",
        Component: TaskList,
      },
      {
        path: "/tasks/:taskId",
        Component: TaskShow,
      },
      {
        path: "/tasks/new",
        Component: TaskCreate,
      },
      {
        path: "/tasks/:taskId/edit",
        Component: TaskEdit,
      },
      // Fallback route for the example routes in dashboard sidebar items
      {
        path: "*",
        Component: TaskList,
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
      <AppTheme {...props} themeComponents={themeComponents}>
        <CssBaseline enableColorScheme />
        <NotificationsProvider>
          <DialogsProvider>
            <RouterProvider router={router} />
          </DialogsProvider>
        </NotificationsProvider>
      </AppTheme>
    </UserProvider>
  );
}
