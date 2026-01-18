import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    EventRepeat as EventRepeatIcon,
    MoreVert as MoreVertIcon,
    Pause as PauseIcon,
    PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Typography
} from '@mui/material';
import { useMemo, useState } from 'react';
import PriorityChip from '../components/PriorityChip';
import { formatFrequency, getPlanPeriodLabel } from '../utils/planFormatters';
import { PLAN_STATUS_CONFIG } from '../utils/planStatus';

const ICON_SIZE = 16;

export default function TaskScheduleCard({ data, onEdit, onDelete, onToggleActive }) {
    const { taskTemplate, recurringPlan } = data || {};

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => setAnchorEl(null);

    const handleAction = (action) => {
        handleMenuClose();
        if (action === 'edit' && onEdit) onEdit(data);
        if (action === 'delete' && onDelete) onDelete(data);
        if (action === 'toggle' && onToggleActive) onToggleActive(data);
    };

    // "ONGOING", "PAUSED", "UPCOMING", "COMPLETED"
    const status = recurringPlan?.displayStatus || "PAUSED";
    const config = PLAN_STATUS_CONFIG[status] || PLAN_STATUS_CONFIG.PAUSED;
    const isRunning = status === "ONGOING";

    const periodLabel = useMemo(() =>
        getPlanPeriodLabel(recurringPlan, status),
        [recurringPlan, status]);

    return (
        <Card
            elevation={1}
            sx={{
                mb: 1.5,
                borderRadius: 2,
                border: `0px solid`,
                borderLeft: `5px solid`,
                boxShadow: 1,
                borderColor: config.color,
                transition: 'all 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                },
                opacity: config.opacity,
            }}
        >
            <CardContent sx={{}}>
                {/* Header Row */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ pr: 1 }}>
                        <Typography variant="subtitle1" component="div" sx={{ mb: 1, fontWeight: 700, lineHeight: 1.2, fontSize: '0.95rem' }}>
                            {taskTemplate.title}
                            <Typography variant="caption" sx={{ ml: 1, color: config.color, fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                                • {config.label}
                            </Typography>
                        </Typography>
                        {/* Description */}
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mb: 1,
                                fontSize: '0.8rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.4,
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {taskTemplate.description || "No description provided."}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Box sx={{ transform: 'scale(0.9)' }}>
                            <PriorityChip priority={taskTemplate.priority} />
                        </Box>

                        <IconButton
                            size="small"
                            onClick={handleMenuClick}
                        >
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Stack>


                <Divider sx={{ my: 1, borderStyle: 'dashed', opacity: 0.6 }} />

                {/* Info Rows */}
                <Stack spacing={0.5}>
                    {/* Frequency */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <EventRepeatIcon color="action" sx={{ fontSize: ICON_SIZE }} />
                        <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ fontSize: '0.75rem' }}>
                            {formatFrequency(recurringPlan)}
                        </Typography>
                    </Stack>

                    {/* Period */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ color: config.color, display: 'flex' }}>{config.icon}</Box>
                        <Typography variant="caption" color="text.secondary">{periodLabel}</Typography>
                    </Stack>
                </Stack>
            </CardContent>

            {/* Compact Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem dense onClick={() => handleAction('edit')}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>

                {/* if the task is not completed, show pause/resume button */}
                {status !== "COMPLETED" && (
                    <MenuItem dense onClick={() => handleAction('toggle')}>
                        <ListItemIcon>{isRunning ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}</ListItemIcon>
                        <ListItemText>{isRunning ? "Pause" : "Resume"}</ListItemText>
                    </MenuItem>
                )}

                <Divider sx={{ my: 0.5 }} />
                <MenuItem dense onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
                    <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>
        </Card>
    );
}