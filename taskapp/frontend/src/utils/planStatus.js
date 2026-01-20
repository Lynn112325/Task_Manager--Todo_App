import {
    AllInclusive as AllInclusiveIcon,
    CheckCircleOutline as CompletedIcon,
    Pause as PauseIcon,
    HourglassTop as UpcomingIcon
} from '@mui/icons-material';
import BoltIcon from '@mui/icons-material/Bolt';
import { alpha } from '@mui/material/styles';

export const PLAN_STATUS_CONFIG = {

    ONGOING: {
        color: alpha('#085be1ff', 0.9),
        opacity: 1,
        icon: <AllInclusiveIcon fontSize="inherit" />,
        label: 'Running'
    },
    UPCOMING: {
        color: alpha('#4123dbff', 0.7),
        opacity: 1,
        icon: <UpcomingIcon fontSize="inherit" />,
        label: 'Upcoming'
    },
    PAUSED: {
        color: alpha('#c3761fff', 0.7),
        opacity: 0.8,
        icon: <PauseIcon fontSize="inherit" />,
        label: 'Paused'
    },
    COMPLETED: {
        color: alpha('#94a3b8', 0.6),
        opacity: 0.6,
        icon: <CompletedIcon fontSize="inherit" />,
        label: 'Completed'
    },
    MANUAL_TRIGGER: {
        color: alpha('#279c6d', 0.7),
        opacity: 0.8,
        icon: <BoltIcon fontSize="inherit" />,
        label: 'Template'
    },
};

export const DEFAULT_STATUS_CONFIG = PLAN_STATUS_CONFIG.PAUSED;