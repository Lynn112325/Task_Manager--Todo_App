import { Chip } from "@mui/material";
import { getPriorityColor, getPriorityLabel } from "../utils/priority";

export default function PriorityChip({ priority }) {
    return (
        <Chip
            variant="outlined"
            label={
                getPriorityLabel(priority)
            }
            size="small"
            color={
                getPriorityColor(priority)
            }
            sx={{ flexShrink: 0 }}
        />
    );
}
