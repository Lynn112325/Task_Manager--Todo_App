import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import dayjs from "dayjs";
import PriorityChip from "./Task/PriorityChip";
import TaskTypeIcon from "./TaskTypeIcon";

const DateDisplay = ({ icon, label, date, fallbackText, color = "text.secondary" }) => {
  const isValidDate = date && !isNaN(new Date(date).getTime());

  const displayValue = isValidDate
    ? formatDateCustom(date)
    : fallbackText;

  return (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box sx={{
        color: 'action.active',
        bgcolor: 'action.hover',
        p: 1,
        borderRadius: 1.5,
        display: 'flex'
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body2"
          sx={{
            color: isValidDate ? color : "text.secondary",
            fontWeight: isValidDate ? 600 : 400,
            fontStyle: isValidDate ? 'normal' : 'italic',
            textDecoration: isValidDate ? 'none' : 'line-through',
            textDecorationColor: 'rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease'
          }}>
          {displayValue}
        </Typography>
      </Box>
    </Box>
  );
};

function formatDateCustom(dateStr) {
  return dayjs(dateStr).format("YYYY/MM/DD (ddd)");
}
export default function TaskCard({ task }) {
  const theme = useTheme();
  if (!task) return null;

  return (
    <Card
      variant="outlined"
      sx={{
        backgroundColor: "#fff",
        flex: 1,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        // pb: 0
      }}
    >
      <CardHeader
        disableTypography
        sx={{ pb: 0 }}
        avatar={
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: 48,
              height: 48,
              borderRadius: 2
            }}
          >
            <TaskTypeIcon type={task.type} sx={{ p: 0.1 }} />
          </Avatar>
        }
        action={
          task.type && (
            <Chip
              label={task.type}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: 1.5,
                bgcolor: 'action.selected',
                color: 'text.primary',
                m: 1
              }}
            />
          )
        }
        title={
          <Box sx={{ mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {task.title}
            </Typography>
          </Box>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <PriorityChip priority={task.priority} />
          </Box>
        }
      />

      <CardContent sx={{ pt: 1 }}>

        {/* Description Area */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
            minHeight: '100px',
            mb: 3
          }}
        >
          <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {task.description || "No description provided."}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />}
        >
          <DateDisplay
            icon={<CalendarTodayIcon fontSize="small" />}
            label="Start Date"
            date={task.startDate}
            fallbackText="Not set"
          />

          <DateDisplay
            icon={<EventAvailableIcon fontSize="small" />}
            label="Due Date"
            date={task.dueDate ? task.dueDate : "No Deadline"}
            color={task.dueDate ? "primary.main" : "text.secondary"}
          />
        </Stack>
        <Divider sx={{ mt: 2, mb: 1, borderStyle: 'dashed' }} />

        {/* Metadata (Created/Updated) */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap', mb: -1, pb: 0 }}>
          {task.createdAt && (
            <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Created: {dayjs(task.createdAt).format('YYYY-MM-DD HH:mm')}
            </Typography>
          )}
          {task.updatedAt && (
            <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Updated: {dayjs(task.updatedAt).format('YYYY-MM-DD HH:mm')}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
