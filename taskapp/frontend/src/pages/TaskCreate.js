import * as React from 'react';
import { useNavigate } from 'react-router';
import PageContainer from '../components/PageContainer';
import TaskForm from '../components/TaskForm';
import { useTasks } from "../hooks/task/useTasks";
import { useTaskType } from "../hooks/task/useTaskType.js";
import { validateTask } from '../hooks/task/validateTask.js';
import useNotifications from '../hooks/useNotifications/useNotifications';

const INITIAL_FORM_VALUES = {
  title: '',
  description: '',
  dueDate: null,
  priority: null,
  type: "",
  isCompleted: false,
};

export default function TaskCreate() {
  const navigate = useNavigate();
  const { type } = useTaskType();
  const {
    createTask,
  } = useTasks(type);

  const notifications = useNotifications();

  const [formState, setFormState] = React.useState(() => ({
    values: INITIAL_FORM_VALUES,
    errors: {},
  }));
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback((newFormValues) => {
    setFormState((previousState) => ({
      ...previousState,
      values: newFormValues,
    }));
  }, []);

  const setFormErrors = React.useCallback((newFormErrors) => {
    setFormState((previousState) => ({
      ...previousState,
      errors: newFormErrors,
    }));
  }, []);

  const handleFormFieldChange = React.useCallback(
    (name, value) => {
      const validateField = async (values) => {
        const { issues } = validateTask(values);
        setFormErrors({
          ...formErrors,
          [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
        });
      };

      const newFormValues = { ...formValues, [name]: value };

      setFormValues(newFormValues);
      validateField(newFormValues);
    },
    [formValues, formErrors, setFormErrors, setFormValues],
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(INITIAL_FORM_VALUES);
  }, [setFormValues]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validateTask(formValues);
    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(issues.map((issue) => [issue.path?.[0], issue.message])),
      );
      return;
    }
    setFormErrors({});
    console.log('Submitting form with values:', formValues);
    try {
      await createTask(formValues);
      notifications.show('Task created successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/tasks/todo');
    } catch (createError) {
      notifications.show(
        `Failed to create task. Reason: ${createError.message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw createError;
    }
  }, [formValues, navigate, notifications, setFormErrors]);

  return (
    <PageContainer
      title="New Task"
      breadcrumbs={[{ title: 'Tasks', path: '/tasks' }, { title: 'New' }]}
    >
      <TaskForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Create"
      />
    </PageContainer>
  );
}
