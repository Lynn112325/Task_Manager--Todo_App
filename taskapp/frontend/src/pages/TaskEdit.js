import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
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
    if (task) return;

    const loadData = async () => {
      const data = await getTask(Number(taskId));
      setTask(data.task);
    };

    loadData();
  }, [task, taskId, getTask]);

  const handleEdit = async (formValues) => {
    const editedTask = await editTaskCompletion(formValues);
    navigate(`/tasks/${editedTask.id}`);
  };

  // ⭐ 在 Page 層使用 hook
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

  if (isLoading || !task) {
    return <CircularProgress />;
  }

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
