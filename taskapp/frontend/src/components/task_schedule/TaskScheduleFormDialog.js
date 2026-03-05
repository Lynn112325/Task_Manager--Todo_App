import RefreshIcon from '@mui/icons-material/Refresh';
import {
    Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, FormControl, FormControlLabel, InputLabel, MenuItem,
    Select, Stack, Switch,
    TextField, Typography
} from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTarget } from "../../hooks/target/useTarget";
import useNotifications from "../../hooks/useNotifications/useNotifications";
import { formatFrequency } from '../../utils/planFormatters';

/**
 * TaskScheduleFormDialog Component
 * * A specialized dialog for creating and managing "Task Blueprints" (recurring schedules).
 * It supports title/description editing, priority levels, and complex recurrence logic 
 * including daily, weekly, and monthly patterns.
 *
 * @param {Object} props
 * @param {boolean} props.open - Controls the visibility of the dialog.
 * @param {Function} props.onClose - Function to trigger when the dialog is dismissed.
 * @param {Object} [props.schedule] - Existing schedule data for edit mode; if null, the dialog operates in "Create" mode.
 * @param {Function} props.onSave - Callback function invoked with (id, payload) on form submission.
 * @param {boolean} [props.isProcessing=false] - Loading state for the submission button.
 * @param {string|number} [props.targetId] - The ID of the target (project/goal) this task belongs to.
 * @param {boolean} [props.skipInitialGeneration=false] - Flag to prevent the backend from creating the first task instance immediately.
 */
export function TaskScheduleFormDialog({
    open, onClose, schedule, onSave, isProcessing, targetId: initialTargetId, skipInitialGeneration = false
}) {

    /**
     * Fetch available targets based on the task template type.
     * This allows users to re-assign the blueprint to a different project/goal.
     */
    const { targets, isLoading: targetsLoading } = useTarget(
        schedule?.taskTemplate?.type || null
    );

    const isEditMode = Boolean(schedule?.taskTemplate?.id);
    const notifications = useNotifications();

    /** * Default values for a new task blueprint.
     * Initialized with current date and 'ACTIVE' status.
     */
    const defaultFormState = {
        targetId: initialTargetId || '',
        title: '',
        description: '',
        priority: 1,
        status: 'ACTIVE',
        recurrenceType: 'NONE',
        recurrenceInterval: 1,
        recurrenceDays: [],
        isHabit: false,
        recurrenceStart: new Date().toISOString().split('T')[0], // Standard YYYY-MM-DD format
        recurrenceEnd: '',
        isPermanent: true
    };

    const [formData, setFormData] = useState(defaultFormState);

    /**
     * Effect Hook: Synchronizes form state with the 'schedule' prop.
     * Triggers when the dialog opens or the data source changes.
     */
    useEffect(() => {
        if (open && schedule) {
            const { taskTemplate, recurringPlan } = schedule;
            setFormData({
                targetId: taskTemplate?.targetId || initialTargetId || '',
                title: taskTemplate?.title || '',
                description: taskTemplate?.description || '',
                priority: taskTemplate?.priority || 1,
                status: recurringPlan?.status || "ACTIVE",
                recurrenceType: recurringPlan?.recurrenceType || 'NONE',
                recurrenceInterval: recurringPlan?.recurrenceInterval || 1,
                recurrenceDays: recurringPlan?.recurrenceDays || [],
                isHabit: recurringPlan?.isHabit || false,
                recurrenceStart: recurringPlan?.recurrenceStart
                    ? dayjs(recurringPlan.recurrenceStart).format('YYYY-MM-DD')
                    : defaultFormState.recurrenceStart,

                recurrenceEnd: recurringPlan?.recurrenceEnd
                    ? dayjs(recurringPlan.recurrenceEnd).format('YYYY-MM-DD')
                    : '',
                isPermanent: !recurringPlan?.recurrenceEnd
            });
        } else if (open && !schedule) {
            // Reset to defaults for new blueprint creation
            setFormData({
                ...defaultFormState,
                targetId: initialTargetId || ''
            });
        }

    }, [open, schedule]);

    /**
     * Handles generic input updates.
     * Includes business logic: Auto-enables Habit Tracking when a recurring type is selected.
     */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            let nextState = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Validation: Prevent interval from going below 1
            if (name === 'recurrenceInterval' && value < 1 && value !== '') {
                return prev;
            }

            // Dependency Logic: Map habit tracking defaults to recurrence type
            if (name === 'recurrenceType') {
                if (value === 'NONE') {
                    nextState.isHabit = false;
                } else {
                    nextState.isHabit = true;
                }
            }
            return nextState;
        });
    };

    /**
     * Resets the form state.
     * Reverts to the original 'schedule' values if in edit mode, otherwise clears the form.
     */
    const handleReset = () => {
        if (isEditMode) {
            const { taskTemplate, recurringPlan } = schedule;
            setFormData(prev => ({ ...prev, targetId: schedule.taskTemplate.targetId }));
            setFormData({
                title: taskTemplate?.title || '',
                description: taskTemplate?.description || '',
                priority: taskTemplate?.priority || 1,
                status: recurringPlan?.status || 'ACTIVE',
                recurrenceType: recurringPlan?.recurrenceType || 'NONE',
                recurrenceInterval: recurringPlan?.recurrenceInterval || 1,
                recurrenceDays: recurringPlan?.recurrenceDays || [],
                isHabit: recurringPlan?.isHabit || false,
                recurrenceStart: recurringPlan?.recurrenceStart || defaultFormState.recurrenceStart,
                recurrenceEnd: recurringPlan?.recurrenceEnd || '',
                isPermanent: !recurringPlan?.endDate
            });
        } else {
            setFormData({ ...defaultFormState, targetId: initialTargetId || '' });
        }
    };

    // Debug log for checking internal task generation flags
    console.log(skipInitialGeneration);

    /**
     * Validates and submits the form data.
     * Constructs a structured payload matching the backend DTO.
     */
    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        const id = schedule?.taskTemplate?.id || null;

        // Validation: Target assignment is mandatory
        if (!formData.targetId) {
            notifications.show("Please select a target for this blueprint.", { severity: 'error' });
            return;
        }

        // Validation: Weekly schedules must have at least one day selected
        if (formData.recurrenceType === 'WEEKLY' && (!formData.recurrenceDays || formData.recurrenceDays.length === 0)) {
            notifications.show("Please select at least one day for weekly recurrence.", {
                severity: 'error'
            });
            return;
        }

        const isNone = formData.recurrenceType === 'NONE';
        const payload = {
            taskTemplate: {
                targetId: Number(formData.targetId),
                title: formData.title?.trim(),
                description: formData.description?.trim(),
                priority: formData.priority
            },
            recurringPlan: {
                status: isNone ? 'ACTIVE' : formData.status,
                recurrenceType: formData.recurrenceType,
                recurrenceInterval: isNone ? null : formData.recurrenceInterval,
                recurrenceDays: isNone ? null : formData.recurrenceDays,
                isHabit: isNone ? false : !!formData.isHabit,
                recurrenceStart: `${formData.recurrenceStart}T00:00:00`,
                recurrenceEnd: formData.isPermanent ? null : `${formData.recurrenceEnd}T23:59:59`
            },
            skipInitialGeneration: skipInitialGeneration
        };
        onSave(id, payload);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <form onSubmit={handleSubmit}>
                {/* Header: Displays mode and current frequency summary */}
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                        {isEditMode ? 'Edit Blueprint' : 'Create New Blueprint'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {formData.status}
                        {(() => {
                            const freqText = formatFrequency(
                                formData.recurrenceType,
                                formData.recurrenceInterval,
                                formData.recurrenceDays,
                                formData.recurrenceStart
                            );
                            return freqText ? ` & ${freqText}` : '';
                        })()}
                    </Typography>
                </DialogTitle>

                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {/* Target Selection: Only visible if a fixed initialTargetId is not provided */}
                        {(!initialTargetId) && (
                            <FormControl fullWidth required>
                                <InputLabel>Assign to Target</InputLabel>
                                <Select
                                    name="targetId"
                                    value={formData.targetId}
                                    onChange={handleChange}
                                    label="Assign to Target"
                                >
                                    {targetsLoading ? (
                                        <MenuItem disabled>Loading targets...</MenuItem>
                                    ) : (
                                        targets?.map(t => (
                                            <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        )}
                    </Stack>
                    <Divider />
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="primary">Basic Info</Typography>

                        <TextField
                            fullWidth label="Blueprint Title" name="title"
                            value={formData.title} onChange={handleChange} required
                        />

                        <TextField
                            fullWidth label="Description" name="description"
                            value={formData.description} onChange={handleChange} required
                            multiline rows={2}
                            sx={{ '& .MuiInputBase-root': { alignItems: 'flex-start', minHeight: '60px' } }}
                        />

                        <Stack direction="row" spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel id="priority-label">Priority</InputLabel>
                                <Select
                                    labelId="priority-label"
                                    id="priority-select"
                                    name="priority"
                                    label="Priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    <MenuItem value={1}>Low</MenuItem>
                                    <MenuItem value={2}>Medium</MenuItem>
                                    <MenuItem value={3}>High</MenuItem>
                                    <MenuItem value={4}>Critical</MenuItem>
                                    <MenuItem value={5}>Urgent</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Plan Status: Only applicable for recurring tasks */}
                            {formData.recurrenceType !== 'NONE' && (
                                <FormControl fullWidth required>
                                    <InputLabel id="status-label">Plan Status</InputLabel>
                                    <Select
                                        labelId="status-label"
                                        id="status-select"
                                        name="status"
                                        label="Plan Status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="ACTIVE">Active</MenuItem>
                                        <MenuItem value="PAUSED">Paused</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        </Stack>

                        <Divider />
                        <Typography variant="subtitle2" color="primary">Timeline & Logic</Typography>

                        {/* Recurrence and Interval Configuration */}
                        <Stack direction="row" spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel id="recurrence-type-label">Recurrence</InputLabel>
                                <Select
                                    labelId="recurrence-type-label"
                                    id="recurrence-type-select"
                                    name="recurrenceType"
                                    label="Recurrence"
                                    value={formData.recurrenceType}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="NONE">One-off / Manual</MenuItem>
                                    <MenuItem value="DAILY">Daily</MenuItem>
                                    <MenuItem value="WEEKLY">Weekly</MenuItem>
                                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                                </Select>
                            </FormControl>

                            {formData.recurrenceType !== 'NONE' && (
                                <TextField
                                    type="number" fullWidth label="Interval" name="recurrenceInterval"
                                    value={formData.recurrenceInterval} onChange={handleChange} required
                                    slotProps={{
                                        input: {
                                            inputProps: { min: 1, step: 1 }
                                        }
                                    }}
                                />
                            )}
                        </Stack>

                        {/* Weekly Day Selection */}
                        {formData.recurrenceType === 'WEEKLY' && (
                            <FormControl fullWidth>
                                <InputLabel>Repeat on Days</InputLabel>
                                <Select
                                    multiple name="recurrenceDays" value={formData.recurrenceDays}
                                    onChange={(e) => setFormData(prev => ({ ...prev, recurrenceDays: e.target.value }))}
                                    renderValue={(s) => s.join(', ')}
                                    label="Repeat on Days"
                                >
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <MenuItem key={day} value={day}>
                                            <Checkbox checked={formData.recurrenceDays.includes(day)} />
                                            {day}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Dates: Start Date (for all) and End Date (if not permanent) */}
                        {formData.recurrenceType !== 'NONE' && (
                            <Stack spacing={2}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        type="date"
                                        label="Start Date"
                                        name="startDate"
                                        fullWidth
                                        value={formData.recurrenceStart}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        helperText={
                                            formData.recurrenceType === 'MONTHLY'
                                                ? "Task triggers on this day each month."
                                                : ""
                                        }
                                    />

                                    {!formData.isPermanent && (
                                        <TextField
                                            type="date"
                                            label="End Date"
                                            name="endDate"
                                            fullWidth
                                            value={formData.recurrenceEnd}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    )}
                                </Stack>

                                {/* Permanent Switch: Disables the End Date requirement */}
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                    justifyContent="space-between"
                                    spacing={1}
                                    sx={{ px: 0.5, mt: 0.5 }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={formData.isPermanent}
                                                onChange={(e) => setFormData(prev => ({ ...prev, isPermanent: e.target.checked }))}
                                            />
                                        }
                                        label={<Typography variant="body2">Never Ends</Typography>}
                                        sx={{ mr: 0 }}
                                    />

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            fontStyle: 'italic',
                                            pl: { xs: 1, sm: 0 },
                                            lineHeight: 1.2
                                        }}
                                    >
                                        * Shifts to month-end for shorter months.
                                    </Typography>
                                </Stack>
                            </Stack>
                        )}

                        {/* Habit Tracking Toggle: Changes how the task is completed in the dashboard */}
                        {formData.recurrenceType !== 'NONE' && (
                            <FormControlLabel
                                control={<Checkbox checked={formData.isHabit} onChange={handleChange} name="isHabit" />}
                                label="Enable Habit Tracking (Check-in style)"
                            />
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button variant="outlined" color="inherit" onClick={handleReset} sx={{ mr: 'auto' }}>
                        <RefreshIcon />
                    </Button>
                    <Button onClick={onClose} color="inherit">Cancel</Button>
                    <Button
                        type='submit' variant="contained"
                    >
                        {isProcessing ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

/**
 * PropType Validation
 */
TaskScheduleFormDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isProcessing: PropTypes.bool,
    targetId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    schedule: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        taskTemplate: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string,
            description: PropTypes.string,
            priority: PropTypes.number,
        }),
        recurringPlan: PropTypes.shape({
            status: PropTypes.string,
            recurrenceType: PropTypes.string,
            recurrenceInterval: PropTypes.number,
            recurrenceDays: PropTypes.array,
            isHabit: PropTypes.bool,
            recurrenceStart: PropTypes.string,
            recurrenceEnd: PropTypes.string,
        }),
    }),
};