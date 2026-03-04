import {
    Chip,
    Skeleton,
    Stack,
    Typography
} from '@mui/material';

// --- Part 1: Content (Title, Description, Chip) ---
export const TargetHeaderContent = ({ target }) => {
    if (!target) return null;
    return (
        <Stack spacing={1} sx={{ m: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px', flexShrink: 0, }}>
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
        </Stack>
    );
};

// --- Skeletons for Loading State ---
export const TargetHeaderContentSkeleton = () => (
    <Stack spacing={1}>
        <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="rounded" width={60} height={24} />
        </Stack>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="40%" />
    </Stack>
);
