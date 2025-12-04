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
import PriorityChip from "./PriorityChip";

export default function TaskItem({ task, checked, onToggle, onRowView }) {
    const dueDate = dayjs(task.dueDate);
    const today = dayjs();
    const isOverdue = dueDate.isBefore(today, "day");

    return (
        <ListItem
            key={task.id}
            sx={{ width: "100%" }}
            secondaryAction={
                <IconButton edge="end" onClick={onRowView}>
                    <VisibilityIcon />
                </IconButton>
            }
        >
            <ListItemButton role={undefined} onClick={onToggle} dense>
                <ListItemIcon>
                    <Checkbox edge="start" checked={checked} tabIndex={-1} />
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
                                    {task.description || ""}
                                </span>
                            </Tooltip>

                            {/* Due Date */}
                            {dueDate.isValid() && !dueDate.isSame(today, "day") && (
                                <span style={{ color: isOverdue ? "red" : "inherit" }}>
                                    {" • "}Due: {dueDate.format("DD/MM")}
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
        </ListItem>
    );
}
