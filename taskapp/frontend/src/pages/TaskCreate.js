import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import PageContainer from '../components/PageContainer';
import TaskForm from '../components/TaskForm';
import useTaskForm from '../hooks/task/useTaskForm.js';
import { useTasks } from "../hooks/task/useTasks";
import { useTaskType } from "../hooks/task/useTaskType.js";

const INITIAL_FORM_VALUES = {
  title: '',
  description: '',
  startDate: dayjs().toISOString(),
  dueDate: dayjs().toISOString(),
  priority: null,
  type: "",
  isCompleted: false,
};

export default function TaskCreate() {
  const navigate = useNavigate();
  const { type } = useTaskType();
  const {
    createTaskCompletion
  } = useTasks(type);

  const handleCreate = async (formValues) => {
    const createdTask = await createTaskCompletion(formValues);
    navigate(`/tasks/${createdTask.id}`);
  };

  const {
    formState,
    handleFieldChange,
    handleReset,
    handleSubmit,
  } = useTaskForm({
    initialValues: INITIAL_FORM_VALUES,
    onSubmit: handleCreate,
  });

  return (
    <PageContainer
      title="New Task"
      breadcrumbs={[{ title: 'Tasks', path: '/tasks' }, { title: 'New' }]}
    >
      <TaskForm
        formState={formState}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        submitButtonLabel="Create"
      />
    </PageContainer>
  );
}
