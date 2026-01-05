import * as React from 'react';
import { validateTask } from './validateTask';

export default function useTaskForm({ initialValues, onSubmit }) {
    const [formState, setFormState] = React.useState(() => ({
        values: initialValues,
        errors: {},
    }));

    const { values, errors } = formState;
    const setFormValues = React.useCallback((newValues) => {
        setFormState((prev) => ({
            ...prev,
            values: newValues,
        }));
    }, []);

    const setFormErrors = React.useCallback((newErrors) => {
        setFormState((prev) => ({
            ...prev,
            errors: newErrors,
        }));
    }, []);

    const handleFieldChange = React.useCallback(
        (name, value) => {
            const newValues = { ...values, [name]: value };
            setFormValues(newValues);

            const { issues } = validateTask(newValues);
            setFormErrors({
                ...errors,
                [name]: issues?.find((i) => i.path?.[0] === name)?.message,
            });
        },
        [values, errors, setFormValues, setFormErrors],
    );

    const handleReset = React.useCallback(() => {
        setFormValues(initialValues);
        setFormErrors({});
    }, [initialValues, setFormValues, setFormErrors]);

    const handleSubmit = React.useCallback(async () => {
        const { issues } = validateTask(values);
        if (issues?.length) {
            setFormErrors(
                Object.fromEntries(issues.map((i) => [i.path?.[0], i.message])),
            );
            return false;
        }

        setFormErrors({});
        await onSubmit(values);
        return true;
    }, [values, onSubmit, setFormErrors]);

    return {
        formState,
        handleFieldChange,
        handleReset,
        handleSubmit,
    };
}
