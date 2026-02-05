import { Chip } from "@mui/material";
import { getPriorityChipColor, getPriorityLabel } from "../../utils/priority";

export default function PriorityChip({ priority }) {
    return (
        <Chip
            variant="outlined"
            label={
                getPriorityLabel(priority)
            }
            size="small"
            color={
                getPriorityChipColor(priority)
            }
            sx={{ flexShrink: 0 }}
        />
    );
}
