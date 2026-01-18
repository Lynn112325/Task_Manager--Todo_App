
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Chip,
    Grid,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';

export const TargetHeaderSkeleton = () => (
    <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={1}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Skeleton variant="text" width={300} height={40} />
                        <Skeleton variant="rounded" width={60} height={24} />
                    </Stack>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="40%" />
                </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ flexGrow: '1' }} >
                <Stack
                    direction="row"
                    spacing={1}
                    justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                >
                    <Skeleton variant="rounded" width={120} height={34} />
                    <Skeleton variant="rounded" width={34} height={34} />
                    <Skeleton variant="rounded" width={34} height={34} />
                </Stack>
            </Grid>
        </Grid>
    </Paper>
);

export const TargetHeader = ({ target, formatDateCustom }) => {
    if (!target) return null;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                width: '100%'
            }}
        >
            <Grid container spacing={2} alignItems="center" sx={{ width: '100%', alignItems: 'flex-start' }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
                                {target.title}
                            </Typography>
                            <Chip
                                label={target.type.toUpperCase()}
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 600, borderRadius: '6px' }}
                            />
                        </Stack>

                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {target.description}
                        </Typography>

                        <Typography variant="caption" color="text.disabled" sx={{ pt: 1 }}>
                            Created at: <b>{formatDateCustom(target.createdAt)}</b> • Last updated: <b>{formatDateCustom(target.updatedAt)}</b>
                        </Typography>
                    </Stack>
                </Grid>

                {/* Action */}
                <Grid size={{ xs: 12, md: 4 }} sx={{ flexGrow: '1' }} >
                    <Stack
                        direction="row"
                        spacing={1}
                        justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                    >
                        <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                        >
                            Add Template
                        </Button>
                        <Tooltip title="Edit">
                            <IconButton>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton color="error">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Grid>
            </Grid>
        </Paper>
    );
}