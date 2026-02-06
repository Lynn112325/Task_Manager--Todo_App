import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
    Box,
    Checkbox,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import dayjs from "dayjs";
import { useState } from "react";
import PriorityChip from "./Task/PriorityChip";
import { TypeChip } from "./Task/TypeChip";
import TaskStatusMenu from "./TaskStatusMenu";

const getDueDateInfo = (dateString) => {
    if (!dateString) return null;
    const d = dayjs(dateString).startOf('day');
    const today = dayjs().startOf('day');
    const diff = d.diff(today, 'day');

    let label = "";
    let color = "text.secondary";

    if (diff < 0) {
        label = `${Math.abs(diff)} days ago`;
        color = "error.main";
        if (diff === -1) label = "Yesterday";
    } else if (diff === 0) {
        label = "Today";
        color = "primary.main";
    } else if (diff === 1) {
        label = "Tomorrow";
        color = "warning.main";
    } else {
        label = `In ${diff} days`;
    }

    return { label, color, rawDate: d };
};

export default function TaskItem({ task, onStatusUpdate, onRowView }) {
    const { label: dateLabel, color: dateColor, rawDate } = getDueDateInfo(task.dueDate) || {};
    const taskStatus = task.status; // ACTIVE, COMPLETED, CANCELED
    const checked = taskStatus === "COMPLETED";

    const isInactive = taskStatus === "COMPLETED" || taskStatus === "CANCELED";

    const [menuPosition, setMenuPosition] = useState(null);

    const handleContextMenu = (event) => {
        event.preventDefault(); // prevent
        setMenuPosition({
            top: event.clientY,
            left: event.clientX,
        });
    };

    const handleStatusChange = (newStatus) => {
        console.log(newStatus);
        onStatusUpdate(newStatus);
        setMenuPosition(null);
    };

    return (
        <>
            <ListItem
                key={task.id}
                sx={{ cursor: 'context-menu', width: "100%" }}
                secondaryAction={
                    <IconButton edge="end" onClick={onRowView}>
                        <VisibilityIcon />
                    </IconButton>
                }
                onContextMenu={handleContextMenu}
                onClick={handleContextMenu}
            >
                <ListItemButton role={undefined} dense>
                    <ListItemIcon>
                        <Checkbox edge="start" checked={checked} indeterminate={taskStatus === 'CANCELED'} disableRipple tabIndex={-1} />
                    </ListItemIcon>
                    <ListItemText
                        primary={task.title}
                        secondary={
                            <Typography
                                component="span"
                                variant="body2"
                                noWrap
                                sx={{
                                    textDecoration: taskStatus === "COMPLETED" ? "line-through" : "none",
                                    color: isInactive ? "text.disabled" : "text.primary",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    minWidth: 0,
                                    flexWrap: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    containerType: 'inline-size',
                                }}
                            >
                                {/* Description */}
                                <Tooltip title={task.description || ""} placement="top">
                                    <Box
                                        component="span"
                                        sx={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            flexShrink: 1,
                                            minWidth: 0,
                                            textOverflow: "clip",
                                            '@container (max-width: 340px)': {
                                                display: 'none',
                                            },
                                        }}
                                    >
                                        {task.description || " -- "}
                                    </Box>
                                </Tooltip>
                                {/* Due Date */}
                                {dateLabel != "Today" && (
                                    <Tooltip title={`Due: ${rawDate.format("YYYY-MM-DD")}`}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: dateColor,
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            border: 1,
                                            borderColor: dateColor,
                                            borderRadius: 1,
                                            px: 0.5,
                                            py: 0.2,
                                            "& > .MuiSvgIcon-root": { color: 'inherit' }
                                        }}>
                                            <AccessTimeIcon color="inherit" sx={{ fontSize: '0.85rem', mr: 0.5, color: dateColor }} />
                                            {dateLabel}
                                        </Box>
                                    </Tooltip>
                                )}

                                {/* Task Type */}
                                {task.type && (
                                    <TypeChip type={task.type} />
                                )}

                                {/* Priority */}
                                <PriorityChip priority={task.priority} />
                            </Typography>
                        }
                        primaryTypographyProps={{
                            sx: {
                                textDecoration: taskStatus === "COMPLETED" ? "line-through" : "none",
                                color: isInactive ? "text.disabled" : "text.primary",
                            },
                        }}
                    />
                </ListItemButton>
            </ListItem >
            <TaskStatusMenu
                anchorEl={menuPosition}
                open={Boolean(menuPosition)}
                onClose={() => setMenuPosition(null)}
                onChange={(newStatus) => handleStatusChange(newStatus)}
                currentStatus={taskStatus}
            />
        </>
    );
}
