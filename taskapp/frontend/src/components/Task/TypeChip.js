import { Chip } from "@mui/material";
import { TYPE_CONFIG } from "../../utils/types";

export const TypeChip = ({ type, size = "small", ...props }) => {
    const config = TYPE_CONFIG[type?.toLowerCase()];

    if (!type || !config) return null;

    const Icon = config.icon;
    const themeColor = config.color || "#666";

    return (
        <Chip
            icon={Icon ? <Icon style={{ color: themeColor }} /> : undefined}
            label={config.label}
            size={size}
            variant="outlined"
            sx={{
                flexShrink: 0,
                fontWeight: 600,
                color: themeColor,
                borderColor: `${themeColor}40`,

                backgroundColor: `${themeColor}08`,
                "& .MuiChip-icon": {
                    fontSize: '0.5rem',
                    color: 'inherit'
                },
                "& .MuiChip-label": {
                    px: 1,
                    color: 'inherit'
                },
                ...props.sx
            }}
            {...props}
        />
    );
};