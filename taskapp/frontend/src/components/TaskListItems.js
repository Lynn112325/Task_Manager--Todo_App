import { List } from "@mui/material";
import TaskItem from "./TaskItem";

export default function TaskListItems({ rows, onStatusUpdate, onRowView }) {
    return (
        <List sx={{
            width: "100%", borderRadius: 2, maxHeight: "67vh", overflowY: "auto",
            ml: -2,
            mr: -1,
            pr: 1,
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent', mt: 2
            },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#e0e0e0', borderRadius: '10px' }
        }}>
            {rows.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onStatusUpdate={(newStatus) => onStatusUpdate(task, newStatus)}
                    onRowView={() => onRowView(task)}
                />
            ))}
        </List>
    );
}
