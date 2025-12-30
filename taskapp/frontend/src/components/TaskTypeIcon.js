import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import { TASK_TYPE_CONFIG } from "../utils/taskTypes";

export default function TaskTypeIcon({
    type,
    fontSize = "small",
    sx = { mr: 2 },
}) {
    const Icon =
        TASK_TYPE_CONFIG[type]?.icon || FormatListBulletedOutlinedIcon;

    return <Icon fontSize={fontSize} sx={sx} />;
}
