import VisibilityIcon from "@mui/icons-material/Visibility";
import {
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
import PriorityChip from "./PriorityChip";
import TaskStatusMenu from "./TaskStatusMenu";

const getRelativeDay = (date) => {
    const d = dayjs(date).startOf('day');
    const now = dayjs().startOf('day');
    const diff = now.diff(d, 'day');

    if (diff === 0) return "Today";
    if (diff === 1) return "1 day ago";
    if (diff > 1) return `${diff} days ago`;
    if (diff === -1) return "Tomorrow";
    return `In ${Math.abs(diff)} days`;
};

export default function TaskItem({ task, onStatusUpdate, onRowView }) {
    const dueDate = dayjs(task.dueDate);
    const today = dayjs();
    // const isOverdue = dueDate.isBefore(today, "day");
    const taskStatus = task.status; // ACTIVE, COMPLETED, CANCELED
    const checked = taskStatus === "COMPLETED";

    const [menuPosition, setMenuPosition] = useState(null);

    // 
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
                                    textDecoration: checked ? "line-through" : "none",
                                    color: checked ? "text.disabled" : "text.secondary",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    flexWrap: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {/* Description */}
                                <Tooltip title={task.description || ""} placement="top">
                                    <span
                                        style={{
                                            maxWidth: "55%",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {task.description || " -- "}
                                    </span>
                                </Tooltip>

                                {/* Due Date */}
                                {dueDate.isValid() && !dueDate.isSame(today, "day") && (
                                    <span style={{ color: "inherit" }}>
                                        {" • "}Due: {getRelativeDay(dueDate)}
                                    </span>
                                )}

                                {/* Task Target */}
                                {/* {task.targetTitle && (
                                <Chip
                                    variant="outlined"
                                    size="small"
                                    label={task.targetTitle}
                                    sx={{ flexShrink: 0 }}
                                />
                            )} */}

                                {/* Priority */}
                                <PriorityChip priority={task.priority} />
                            </Typography>
                        }
                        primaryTypographyProps={{
                            sx: {
                                textDecoration: checked ? "line-through" : "none",
                                color: checked ? "text.disabled" : "text.primary",
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
