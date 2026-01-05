// mui TextField does not support readOnly multiline well, so I create a custom component
import { alpha, Box, Typography, useTheme } from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useColorScheme } from '@mui/material/styles';
const StyledTextarea = ({
    value,
    onChange,
    name,
    readOnly = true,
    placeholder = "No description provided.",
}) => {
    const theme = useTheme();
    const { mode } = useColorScheme();
    const isDark = mode === 'dark';

    const backgroundColor = isDark
        ? alpha(theme.palette.background.paper, 0.15)
        : 'rgba(252, 252, 252, 0.79)';

    const borderColor = alpha(theme.palette.divider, isDark ? 0.1 : 0.8);
    const textColor = !readOnly
        ? '#000000ff'
        : (isDark ? '#fff' : alpha(theme.palette.text.primary, 0.65));

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography
                variant="body2"
                sx={{ mb: 0.5, color: textColor, fontWeight: 500, fontSize: 12 }}
            >
                Description
            </Typography>

            <Box
                sx={{
                    borderRadius: 1,
                    border: `1px solid ${borderColor}`,
                    backgroundColor,
                }}
            >
                <TextareaAutosize
                    minRows={4}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    readOnly={readOnly}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        backgroundColor: 'transparent',
                        fontFamily: 'inherit',
                        fontSize: 15,
                        color: textColor,
                        padding: 12,
                        boxSizing: 'border-box',
                    }}
                />
            </Box>
        </Box>
    );
};
export default StyledTextarea;