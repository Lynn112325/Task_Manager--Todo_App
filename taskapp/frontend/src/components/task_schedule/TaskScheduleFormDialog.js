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
import useNotifications from "../../hooks/useNotifications/useNotifications";
import { formatFrequency } from '../../utils/planFormatters';

/**
 * A dialog form component for creating or editing task schedules (blueprints).
 * Handles task details, recurrence patterns, and habit tracking settings.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is currently visible.
 * @param {Function} props.onClose - Callback function to close the dialog.
 * @param {Function} props.onSave - Callback function invoked when saving the form data.
 * @param {boolean} [props.isProcessing=false] - Indicates if a save operation is in progress (disables button).
 * @param {string|number} [props.targetId] - The ID of the target object the task is linked to (e.g., project ID).
 * @param {Object} [props.schedule] - The existing schedule data to edit. If null, form acts as "Create".
 */
export function TaskScheduleFormDialog({
    open, onClose, schedule, onSave, isProcessing, targetId
}) {
    const isEditMode = Boolean(schedule);
    const notifications = useNotifications();

    // Initial state for a new task blueprint
    const defaultFormState = {
        title: '',
        description: '',
        priority: 1,
        status: 'ACTIVE',
        recurrenceType: 'NONE',
        recurrenceInterval: 1,
        recurrenceDays: [],
        isHabit: false,
        recurrenceStart: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        recurrenceEnd: '',
        isPermanent: true
    };

    const [formData, setFormData] = useState(defaultFormState);

    // Load schedule data when dialog opens in edit mode
    useEffect(() => {
        if (open && schedule) {
            if (isEditMode) {
                const { taskTemplate, recurringPlan } = schedule;
                setFormData({
                    title: taskTemplate?.title || '',
                    description: taskTemplate?.description || '',
                    priority: taskTemplate?.priority || 1,
                    status: recurringPlan?.status,
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
            } else {
                setFormData(defaultFormState);
            }

        }

    }, [open, schedule]);

    // Handle form input changes and dependencies
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            let nextState = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };
            if (name === 'recurrenceInterval' && value < 1 && value !== '') {
                return;
            }
            // Dependency Logic: Auto-update habit tracking based on recurrence type
            if (name === 'recurrenceType') {
                if (value === 'NONE') {
                    nextState.isHabit = false; // Disable habits for one-off tasks
                } else {
                    nextState.isHabit = true;  // Default enable habits for recurring tasks
                }
            }
            return nextState;
        });
    };

    // Reset form to initial state or revert edits
    const handleReset = () => {
        if (isEditMode) {
            const { taskTemplate, recurringPlan } = schedule;
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
            setFormData(defaultFormState);
        }
    };

    // Construct payload and submit form data
    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        const id = schedule?.taskTemplate?.id || null;

        if (formData.recurrenceType === 'WEEKLY' && (!formData.recurrenceDays || formData.recurrenceDays.length === 0)) {
            notifications.show("Please select at least one day for weekly recurrence.", {
                severity: 'error'
            });
            return;
        }
        const isNone = formData.recurrenceType === 'NONE';
        const payload = {
            taskTemplate: {
                targetId: Number(targetId),
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
            }
        };
        onSave(id, payload);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <form onSubmit={handleSubmit}>
                {/* Dialog Header with dynamic title and status summary */}
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

                        {/* Day Selection for Weekly Recurrence */}
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

                        {/* Date Interval Configuration */}
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

                                {/* Permanent Task Switch and Info */}
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

                        {/* Habit Tracking Configuration */}
                        {formData.recurrenceType !== 'NONE' && (
                            <FormControlLabel
                                control={<Checkbox checked={formData.isHabit} onChange={handleChange} name="isHabit" />}
                                label="Enable Habit Tracking (Check-in style)"
                            />
                        )}
                    </Stack>
                </DialogContent>

                {/* Dialog Footer Actions */}
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

// PropType definitions for runtime validation
TaskScheduleFormDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isProcessing: PropTypes.bool,
    targetId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
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