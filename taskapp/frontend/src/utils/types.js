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
    },
    work: {
        label: "Work",
        icon: WorkHistoryOutlinedIcon,
    },
    life: {
        label: "Life",
        icon: LightModeOutlinedIcon,
    },
    study: {
        label: "Study",
        icon: LightbulbOutlinedIcon,
    },
    shopping: {
        label: "Shopping",
        icon: ShoppingCartOutlinedIcon,
    },
};

