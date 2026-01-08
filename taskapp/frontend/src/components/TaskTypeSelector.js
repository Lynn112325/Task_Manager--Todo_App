import { MenuItem, Select } from "@mui/material";
import { TYPES_WITH_ALL } from "../utils/types";
import TaskTypeIcon from "./TaskTypeIcon";

export default function TaskTypeSelector({
    type,
    handleTypeChange,
}) {
    const types = TYPES_WITH_ALL;

    return (
        <Select
            name="type"
            label="Type"
            onChange={handleTypeChange}
            value={type}
            displayEmpty
            inputProps={{ "aria-label": "Task type selector" }}
            sx={{ flex: 1, minWidth: 150 }}
        >
            {types.map((taskType) => (
                <MenuItem key={taskType} value={taskType}>
                    <TaskTypeIcon type={taskType} sx={{ mr: 1 }} />
                    {capitalize(taskType)}
                </MenuItem>
            ))}
        </Select>
    );
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
