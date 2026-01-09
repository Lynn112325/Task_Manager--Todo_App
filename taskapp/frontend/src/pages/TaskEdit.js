import { Alert, Box, CircularProgress } from '@mui/material';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLocation } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import TaskForm from '../components/TaskForm';
import useTaskForm from '../hooks/task/useTaskForm.js';
import { useTasks } from "../hooks/task/useTasks.js";

export default function TaskEdit() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { getTask, editTaskCompletion, isLoading, error } = useTasks();

  const initialTask = location.state?.task ?? null;
  const [task, setTask] = React.useState(initialTask);

  React.useEffect(() => {

    const loadData = async () => {
      const fetchedTask = await getTask(Number(taskId));
      if (fetchedTask) {
        setTask(fetchedTask);
      }
    };

    loadData();
  }, [taskId, getTask]);

  const handleEdit = async (formValues) => {
    const editedTask = await editTaskCompletion(formValues);
    navigate(`/tasks/${editedTask.id}`);
  };

  const {
    formState,
    handleFieldChange,
    handleReset,
    handleSubmit,
  } = useTaskForm({
    initialValues: task,
    onSubmit: handleEdit,
    enableReinitialize: true,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!task) return <Alert severity="warning">Task not found.</Alert>;

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <PageContainer title={`Edit Task ${taskId}`}>
      <TaskForm
        formState={formState}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        submitButtonLabel="Save"
        backButtonPath={`/tasks/${taskId}`}
      />
    </PageContainer>
  );
}
