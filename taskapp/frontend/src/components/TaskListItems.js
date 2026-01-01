import { List } from "@mui/material";
import TaskItem from "./TaskItem";

export default function TaskListItems({ rows, onToggle, onRowView }) {
    return (
        <List sx={{ width: "100%", maxHeight: "calc(67vh)", overflowY: "auto", marginLeft: -2, marginRight: -2 }}>
            {rows.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    checked={task.isCompleted}
                    onToggle={() => onToggle(task)}
                    onRowView={() => onRowView(task)}
                />
            ))}
        </List>
    );
}
