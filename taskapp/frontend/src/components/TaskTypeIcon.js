import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';

export default function TaskTypeIcon({ type, fontSize = "small", sx = { marginRight: 2 }}) {
    return (
        {
            "all": <FormatListBulletedOutlinedIcon fontSize={fontSize} sx={sx} />,
            "work": <WorkHistoryOutlinedIcon fontSize={fontSize} sx={sx} />,
            "life": <LightModeOutlinedIcon fontSize={fontSize} sx={sx} />,
            "study": <LightbulbOutlinedIcon fontSize={fontSize} sx={sx} />,
            "shopping": <ShoppingCartOutlinedIcon fontSize={fontSize} sx={sx} />,
        }[type] || <FormatListBulletedOutlinedIcon fontSize={fontSize} sx={sx} />
    );
}
