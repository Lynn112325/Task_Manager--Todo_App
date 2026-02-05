import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";

export const TYPES = ['work', 'life', 'study', 'shopping'];
export const TYPES_WITH_ALL = ['all', ...TYPES];
export const TYPE_CONFIG = {
    all: {
        label: "All",
        icon: FormatListBulletedOutlinedIcon,
        color: "#607d8b",
    },
    work: {
        label: "Work",
        icon: WorkHistoryOutlinedIcon,
        color: "#1976d2",
    },
    life: {
        label: "Life",
        icon: LightModeOutlinedIcon,
        color: "#2e7d32",
    },
    study: {
        label: "Study",
        icon: LightbulbOutlinedIcon,
        color: "#7b1fa2",
    },
    shopping: {
        label: "Shopping",
        icon: ShoppingCartOutlinedIcon,
        color: "#ed6c02",
    },
};

