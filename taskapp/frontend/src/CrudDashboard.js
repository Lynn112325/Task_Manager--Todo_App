import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createHashRouter, RouterProvider } from 'react-router';
import DashboardLayout from './components/DashboardLayout';
import TaskList from './components/TaskList';
import TaskShow from './components/TaskShow';
import TaskCreate from './components/TaskCreate';
import TaskEdit from './components/TaskEdit';
import NotificationsProvider from './hooks/useNotifications/NotificationsProvider';
import DialogsProvider from './hooks/useDialogs/DialogsProvider';
import AppTheme from '../shared-theme/AppTheme';
import {
  dataGridCustomizations,
  datePickersCustomizations,
  sidebarCustomizations,
  formInputCustomizations,
} from './theme/customizations';

const router = createHashRouter([
  {
    Component: DashboardLayout,
    children: [
      {
        path: '/tasks',
        Component: TaskList,
      },
      {
        path: '/tasks/:taskId',
        Component: TaskShow,
      },
      {
        path: '/tasks/new',
        Component: TaskCreate,
      },
      {
        path: '/tasks/:taskId/edit',
        Component: TaskEdit,
      },
      {
        path: '/tasks/today',
        Component: TodayTasks,
      },
      // Fallback route for the example routes in dashboard sidebar items
      {
        path: '*',
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

export default function CrudDashboard(props) {
  return (
    <AppTheme {...props} themeComponents={themeComponents}>
      <CssBaseline enableColorScheme />
      <NotificationsProvider>
        <DialogsProvider>
          <RouterProvider router={router} />
        </DialogsProvider>
      </NotificationsProvider>
    </AppTheme>
  );
}
