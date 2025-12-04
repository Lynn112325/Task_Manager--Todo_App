// mui TextField does not support readOnly multiline well, so I create a custom component
import { alpha, Box, Typography, useTheme } from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useColorScheme } from '@mui/material/styles';

const StyledTextarea = ({ value, readOnly = true }) => {
    const theme = useTheme();
    const displayValue = value?.trim() || '';

    const { mode } = useColorScheme();
    const isDark = mode === 'dark';

    const backgroundColor =
        isDark
            ? alpha(theme.palette.background.paper, 0.15)
            : 'rgba(252, 252, 252, 0.79)';

    const borderColor = alpha(theme.palette.divider, isDark ? 0.1 : 0.8);

    const textColor =
        isDark ? '#fff' : alpha(theme.palette.text.primary, 0.65);

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Label */}
            <Typography
                variant="body2"
                sx={{
                    mb: 0.5,
                    color: textColor,
                    fontWeight: 500,
                    fontSize: 12,
                }}
            >
                Description
            </Typography>

            <Box
                sx={{
                    position: 'relative',
                    borderRadius: 1,
                    border: `1px solid ${borderColor}`,
                    backgroundColor,
                    transition: 'background-color 0.3s, transform 0.2s',
                }}
            >
                <TextareaAutosize
                    minRows={4}
                    readOnly={readOnly} // readOnly or editable
                    placeholder="No description provided."
                    value={displayValue}
                    style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        backgroundColor: 'transparent',
                        fontFamily: 'inherit',
                        fontSize: '16px',
                        color: textColor,
                        padding: '12px',
                        boxSizing: 'border-box',
                        cursor: readOnly ? 'default' : 'text',
                        boxShadow: 'unset !important',
                    }}
                />
            </Box>
        </Box>
    );
};

export default StyledTextarea;
