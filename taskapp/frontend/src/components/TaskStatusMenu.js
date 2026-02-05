import { ListItemIcon, ListItemText, Menu, MenuItem, Radio } from '@mui/material';

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'To Do' },
    { value: 'COMPLETED', label: 'Mark as Done' },
    { value: 'CANCELED', label: 'Mark as Canceled' },
];

export default function TaskStatusMenu({ anchorEl, open, onClose, onChange, currentStatus }) {

    // skip the selected option
    const availableOptions = STATUS_OPTIONS.filter(option => option.value !== currentStatus);

    return (
        <Menu
            anchorEl={null}
            open={open}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={
                anchorEl ? { top: anchorEl.top, left: anchorEl.left } : undefined
            }
            slotProps={{
                paper: {
                    sx: {
                        minWidth: 160,
                        boxShadow: '0px 3px 12px rgba(0,0,0,0.15)',
                        borderRadius: '8px'
                    }
                }
            }}
        >
            {availableOptions.map((option) => (
                <MenuItem
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    dense
                    sx={{ py: 0.8 }}
                >
                    <ListItemIcon sx={{ minWidth: '32px !important' }}>
                        <Radio
                            checked={false}
                            size="small"
                            sx={{
                                p: 0,
                                color: 'action.disabled',
                                '&.Mui-checked': { color: 'primary.main' }
                            }}
                        />
                    </ListItemIcon>
                    <ListItemText
                        primary={option.label}
                        slotProps={{
                            primary: {
                                sx: {
                                    fontSize: '13px !important',
                                    fontWeight: 500,
                                    color: option.value === 'CANCELED' ? '#ae2424' : 'text.primary'
                                }
                            }
                        }}
                    />
                </MenuItem>
            ))}
        </Menu>
    );
}