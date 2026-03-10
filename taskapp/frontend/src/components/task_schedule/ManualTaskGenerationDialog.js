import { Event as EventIcon, PostAdd as PostAddIcon } from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';

const ManualTaskGenerationDialog = ({ open, onClose, schedule, onGenerate }) => {
    const [formData, setFormData] = useState({
        startDate: '',
        dueDate: '',
    });

    // Default dates to "Now" and "Now + 1 hour" when dialog opens
    useEffect(() => {
        if (open) {
            const now = new Date();
            const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

            const formatLocal = (date) => {
                const offset = date.getTimezoneOffset() * 60000;
                return new Date(date - offset).toISOString().slice(0, 16);
            };

            setFormData({
                startDate: formatLocal(now),
                dueDate: formatLocal(nextHour),
            });
        }
    }, [open]);

    const handleSubmit = () => {
        // Basic validation
        if (new Date(formData.dueDate) < new Date(formData.startDate)) {
            alert("Due date cannot be before start date");
            return;
        }

        // Combine template data with user-input dates
        onGenerate({
            ...schedule.taskTemplate,
            startDate: formData.startDate,
            dueDate: formData.dueDate,
            isManual: true // Important for your backend logic
        });
        onClose();
    };

    if (!schedule) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PostAddIcon color="primary" />
                Generate Manual Task
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {/* Schedule Detail Section */}
                    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            Template Details
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                            {schedule.taskTemplate.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {schedule.taskTemplate.description || 'No description provided.'}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Chip label={`Priority: ${schedule.taskTemplate.priority}`} size="small" variant="outlined" />
                            <Chip label={schedule.taskTemplate.type} size="small" variant="outlined" />
                        </Stack>
                    </Box>

                    <Divider>Set Timeline</Divider>

                    {/* Date Inputs */}
                    <TextField
                        label="Start Date & Time"
                        type="datetime-local"
                        fullWidth
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        label="Due Date & Time"
                        type="datetime-local"
                        fullWidth
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    startIcon={<EventIcon />}
                    disableElevation
                >
                    Generate
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ManualTaskGenerationDialog;