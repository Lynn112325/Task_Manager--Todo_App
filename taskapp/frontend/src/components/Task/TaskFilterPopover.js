import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
    Box,
    Button,
    Divider,
    ListItemIcon,
    ListItemText,
    MenuItem,
    MenuList,
    Popover,
    Stack,
    Typography,
    alpha
} from '@mui/material';
import { useState } from 'react';
import { TYPES_WITH_ALL, TYPE_CONFIG } from '../../utils/types';

export const TaskFilterPopover = ({
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    handleClearFilters,
    hasActiveFilters,
    activeFilterCount
}) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const open = Boolean(anchorEl);

    const STATUS_OPTIONS = [
        { value: 'ALL', label: 'All Status' },
        { value: 'ACTIVE', label: 'Ongoing' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELED', label: 'Canceled' }
    ];

    return (
        <>
            <Button
                variant={hasActiveFilters ? "contained" : "outlined"}
                size="small"
                startIcon={<FilterListIcon />}
                onClick={handleClick}
                sx={{
                    borderRadius: '18px',
                    textTransform: 'none',
                    fontWeight: 600,
                    color: hasActiveFilters ? 'white' : 'text.secondary',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none', borderColor: 'primary.main' }
                }}
            >
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        sx: {
                            width: 240,
                            mt: 1.5,
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                            border: '1px solid',
                            borderColor: 'divider'
                        }
                    }
                }}
            >
                <Box sx={{ p: 2, pb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        Filter Options
                    </Typography>
                </Box>

                <Stack spacing={0.5} sx={{ pb: 1 }}>
                    {/* Status Section */}
                    <Typography variant="overline" sx={{ px: 2, pt: 1, color: 'text.disabled', fontWeight: 700, lineHeight: 1.5 }}>
                        Status
                    </Typography>
                    <MenuList dense sx={{ py: 0 }}>
                        {STATUS_OPTIONS.map((item) => {
                            const isSelected = filterStatus === item.value;
                            return (
                                <MenuItem
                                    key={item.value}
                                    selected={isSelected}
                                    onClick={() => setFilterStatus(item.value)}
                                    sx={{ py: 1, mx: 1, borderRadius: 1.5 }}
                                >
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            sx: {
                                                color: isSelected ? 'text.primary' : 'text.secondary',
                                                fontWeight: isSelected ? 600 : 400,
                                                fontSize: '0.85rem',
                                                ml: 0.5
                                            }
                                        }}
                                    />
                                    {isSelected && <CheckIcon sx={{ fontSize: '1.1rem', color: 'primary.main' }} />}
                                </MenuItem>
                            );
                        })}
                    </MenuList>

                    <Divider sx={{ my: 1, mx: 2, opacity: 0.6 }} />

                    {/* Task Type Section */}
                    <Typography variant="overline" sx={{ px: 2, color: 'text.disabled', fontWeight: 700, lineHeight: 1.5 }}>
                        Category
                    </Typography>
                    <MenuList dense sx={{ py: 0 }}>
                        {TYPES_WITH_ALL.map((typeName) => {
                            const config = TYPE_CONFIG[typeName];
                            const Icon = config.icon;
                            const isSelected = filterType === typeName;

                            return (
                                <MenuItem
                                    key={typeName}
                                    selected={isSelected}
                                    onClick={() => setFilterType(typeName)}
                                    sx={{ py: 0.8, mx: 1, borderRadius: 1.5 }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 26,
                                                height: 26,
                                                borderRadius: '6px',
                                                bgcolor: isSelected ? alpha(config.color, 0.2) : alpha(config.color, 0.08),
                                                transition: '0.2s'
                                            }}
                                        >
                                            <Icon sx={{ fontSize: '0.95rem', color: config.color }} />
                                        </Box>
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={config.label}
                                        primaryTypographyProps={{
                                            sx: {
                                                color: isSelected ? 'text.primary' : 'text.secondary',
                                                fontWeight: isSelected ? 600 : 400,
                                                fontSize: '0.85rem'
                                            }
                                        }}
                                    />
                                    {isSelected && <CheckIcon sx={{ fontSize: '1.1rem', color: 'primary.main' }} />}
                                </MenuItem>
                            );
                        })}
                    </MenuList>
                </Stack>

                {/* Footer Action */}
                <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                        variant="text"
                        size="small"
                        fullWidth
                        color="inherit"
                        onClick={() => {
                            handleClearFilters();
                            handleClose();
                        }}
                        disabled={!hasActiveFilters}
                        startIcon={<CloseIcon />}
                        sx={{
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: hasActiveFilters ? 'error.light' : 'text.disabled',
                            '&:hover': { bgcolor: alpha('#f44336', 0.05), color: 'error.main' }
                        }}
                    >
                        Reset Filters
                    </Button>
                </Box>
            </Popover>
        </>
    );
};