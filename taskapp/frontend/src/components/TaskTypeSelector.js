
import { MenuItem, Select } from "@mui/material";
import TaskTypeIcon from "./TaskTypeIcon";
export default function TaskTypeSelector({ type, handleTypeChange }) {
    return (
        <Select
            value={type}
            onChange={handleTypeChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            sx={{ flex: 1, minWidth: 150 }}
        >
            <MenuItem value="all">
                <TaskTypeIcon type="all" />
                <em>All</em>
            </MenuItem>
            <MenuItem value={"work"}><TaskTypeIcon type="work"/>Work</MenuItem>
            <MenuItem value={"life"}><TaskTypeIcon type="life"/>Life</MenuItem>
            <MenuItem value={"study"}><TaskTypeIcon type="study"/>Study</MenuItem>
            <MenuItem value={"shopping"}><TaskTypeIcon type="shopping"/>shopping</MenuItem>
        </Select>
    );
}