import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import { TYPE_CONFIG } from "../utils/types";

export default function TaskTypeIcon({
    type,
    fontSize = "small",
    sx = { mr: 2 },
}) {
    const Icon =
        TYPE_CONFIG[type]?.icon || FormatListBulletedOutlinedIcon;

    return <Icon fontSize={fontSize} sx={sx} />;
}
