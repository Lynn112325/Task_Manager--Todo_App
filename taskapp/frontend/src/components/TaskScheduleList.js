import {
    EventRepeat as RepeatIcon
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import {
    Badge,
    Box,
    Button,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Popover,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { useState } from 'react';
import TaskScheduleCard from '../components/TaskScheduleCard';
import { useTaskSchedules } from '../hooks/TaskSchedules/useTaskSchedules';

export default function TaskScheduleList({ taskSchedules: initialData, handleEdit, handleDelete, handleToggle }) {

    const {
        taskSchedules: filteredSchedules,
        // States
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,
        searchTerm,
        setSearchTerm,
        // Derived Data
        activeFilterCount,
        hasActiveFilters,
        // Actions
        handleClearFilters
    } = useTaskSchedules({ initialData });

    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const isFilterOpen = Boolean(filterAnchorEl);

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    }
    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    }


    return (
        <Grid>
            {/* Title Area */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RepeatIcon /> Task Blueprints
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {filteredSchedules.length} items
                </Typography>
            </Stack>

            {/* --- Toolbar: Search + Filter Button --- */}
            <Stack direction="row" spacing={1} mb={2} alignItems="center">
                <TextField
                    size="small"
                    placeholder="Search blueprints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    hiddenLabel
                    sx={{
                        flexGrow: 1,
                        '& .MuiOutlinedInput-root': {
                            fontSize: '0.85rem',
                            backgroundColor: 'background.paper'
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchTerm('')}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />

                {/* Filter Toggle Button */}
                <Tooltip title="Filters">
                    <IconButton
                        onClick={handleFilterClick}
                        color={hasActiveFilters ? "primary" : "default"}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            padding: '7px'
                        }}
                    >
                        <Badge badgeContent={activeFilterCount} color="primary" invisible={activeFilterCount === 0}>
                            <FilterListIcon fontSize="small" />
                        </Badge>
                    </IconButton>
                </Tooltip>
            </Stack>

            {/* --- Filter Popover --- */}
            <Popover
                open={isFilterOpen}
                anchorEl={filterAnchorEl}
                onClose={handleFilterClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { p: 2, width: 220 } } }}
            >
                <Stack spacing={2}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        Filter Options
                    </Typography>

                    <FormControl size="small" fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filterStatus}
                            label="Status"
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <MenuItem value="ALL">All Status</MenuItem>
                            <MenuItem value="ONGOING">Ongoing (Active Now)</MenuItem>
                            <MenuItem value="UPCOMING">Upcoming (Scheduled)</MenuItem>
                            <MenuItem value="PAUSED">Paused (Manual Off)</MenuItem>
                            <MenuItem value="COMPLETED">Completed (Time Ended)</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={filterType}
                            label="Type"
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <MenuItem value="ALL">All Frequency</MenuItem>
                            <MenuItem value="DAILY">Daily</MenuItem>
                            <MenuItem value="WEEKLY">Weekly</MenuItem>
                            <MenuItem value="MONTHLY">Monthly</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Clear Filters Button */}
                    <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        color="inherit"
                        onClick={handleClearFilters}
                        disabled={!hasActiveFilters}
                        startIcon={<CloseIcon />}
                    >
                        Clear Filters
                    </Button>
                </Stack>
            </Popover>

            {/* --- Scrollable List Area --- */}
            <Box
                sx={{
                    maxHeight: 'calc(100vh - 480px)',
                    minHeight: '300px',
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        borderRadius: '3px'
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: 'rgba(0,0,0,0.2)'
                    }
                }}
            >
                {filteredSchedules.map((item) => (
                    <TaskScheduleCard
                        key={item.taskTemplate.id}
                        data={item}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={handleToggle}
                    />
                ))}

                {filteredSchedules.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
                        <Typography variant="body2">
                            No tasks found.
                        </Typography>
                        {hasActiveFilters && (
                            <Button size="small" onClick={handleClearFilters} sx={{ mt: 1 }}>
                                Clear Filters
                            </Button>
                        )}
                    </Box>
                )}
            </Box>
        </Grid >
    );
}