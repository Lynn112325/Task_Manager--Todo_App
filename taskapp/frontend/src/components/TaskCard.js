import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import dayjs from "dayjs";
import PriorityChip from "./PriorityChip";
import StyledTextarea from "./StyledTextarea";
import TaskTypeIcon from "./TaskTypeIcon";

function formatDateCustom(dateStr) {
  return dayjs(dateStr).format("YYYY/MM/DD (ddd)");
}
export default function TaskCard({ task }) {
  if (!task) return null;

  return (
    <Card sx={{ backgroundColor: "#fafafa", flex: 1 }}>
      <CardHeader
        sx={{ height: "60px" }}
        avatar={
          <Avatar
            aria-label="task"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TaskTypeIcon
              type={task.type}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Avatar>
        }
        title={
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {task.title}
          </Typography>
        }
        subheader={<PriorityChip priority={task.priority} />}
        action={
          task.type && (
            <Box sx={{ m: 2, ms: 1, me: 1 }}>
              <Chip
                variant="outlined"
                label={task.type}
                size="small"
                sx={{ flexShrink: 0 }}
              />
            </Box>
          )
        }
      />

      <CardContent>
        <Divider sx={{ my: 2 }} />

        <StyledTextarea value={task.description} />

        {/* Dates */}
        <Grid container sx={{ mt: 3 }} spacing={2}>
          {task.startDate && (
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField
                label="Start Date"
                value={formatDateCustom(task.startDate)}
                size="small"
                disabled
                fullWidth
              />
            </Grid>
          )}

          {task.dueDate && (
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField
                label="Due Date"
                value={formatDateCustom(task.dueDate)}
                size="small"
                disabled
                fullWidth
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
