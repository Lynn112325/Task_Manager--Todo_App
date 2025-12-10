import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Avatar, CardContent, CardHeader, Chip, TextField } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/system";
import dayjs from "dayjs";
import * as React from "react";
import { useNavigate, useParams } from "react-router";
import HabitStatsCard from "../components/HabitStatsCard.js";
import PageContainer from "../components/PageContainer";
import PriorityChip from "../components/PriorityChip.js";
import RecurringPlanCard from "../components/RecurringPlanCard.js";
import StyledTextarea from "../components/StyledTextarea.js";
import TaskTypeIcon from "../components/TaskTypeIcon.js";
import { useTasks } from "../hooks/task/useTasks.js";
import { useDialogs } from "../hooks/useDialogs/useDialogs";
import useNotifications from "../hooks/useNotifications/useNotifications";

export default function TaskShow() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { getTaskDetail, deleteTask, error, isLoading } = useTasks();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [task, setTask] = React.useState(null);
  const [recurringPlan, setRecurringPlan] = React.useState(null);
  const [habitStats, setHabitStats] = React.useState([]);

  function formatDateCustom(dateStr) {
    return dayjs(dateStr).format("YYYY/MM/DD (ddd)");
  }

  const loadData = React.useCallback(async () => {
    try {
      const taskData = await getTaskDetail(Number(taskId));
      setTask(taskData.task);
      setRecurringPlan(taskData.recurringPlan || null);
      setHabitStats(taskData.habitStats || []);
    } catch (showDataError) {
      console.error("Failed to load task:", showDataError);
    }
  }, [taskId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTaskEdit = React.useCallback(() => {
    navigate(`/tasks/${taskId}/edit`);
  }, [navigate, taskId]);

  const handleTaskDelete = React.useCallback(async () => {
    if (!task) {
      return;
    }

    const confirmed = await dialogs.confirm(
      `Do you wish to delete Task: ${task.title}?`,
      {
        title: `Delete task?`,
        severity: "error",
        okText: "Delete",
        cancelText: "Cancel",
      }
    );

    if (confirmed) {
      // setIsLoading(true);
      try {
        await deleteTask(Number(taskId));

        navigate("/tasks/todo");

        notifications.show("Task deleted successfully.", {
          severity: "success",
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          `Failed to delete task. Reason:' ${deleteError.message}`,
          {
            severity: "error",
            autoHideDuration: 3000,
          }
        );
      }
      // setIsLoading(false);
    }
  }, [task, dialogs, taskId, navigate, notifications]);

  const handleBack = React.useCallback(() => {
    navigate("/tasks/todo");
  }, [navigate]);

  const renderShow = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      );
    }

    return task ? (
      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <Card variant="outlined" sx={{ width: "100%", boxShadow: 2, minHeight: "80%" }}>
          <Box sx={{ p: 2 }}>

            <Grid container spacing={2} sx={{ flex: 1 }}>
              <Grid size={{ xs: 12, sm: 12, md: 7 }} sx={{ width: "100%" }}>
                <Card sx={{
                  height: "100%",
                  transform: "translateY(0)",
                  "&:hover": {
                    backgroundColor: "action.selected",
                  },
                }}>
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
                        <TaskTypeIcon type={task.type} sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }} />
                      </Avatar>

                    }
                    title={
                      <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                        {task.title}
                      </Typography>
                    }
                    subheader={<PriorityChip priority={task.priority} />}
                    action={
                      task.targetTitle && (
                        <Box
                          sx={{
                            m: 2,
                            ms: 1,
                            me: 1,
                          }}
                        >
                          <Chip
                            variant="outlined"
                            label={task.targetTitle}
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

                    <Grid container gap={2} sx={{ mt: 2 }}>
                      {task.startDate && (
                        <Grid item xs={12} sm={6} md={6}>
                          <TextField
                            label="Start Date"
                            defaultValue={formatDateCustom(task.startDate)}
                            size="small"
                            disabled
                            fullWidth
                          />
                        </Grid>
                      )}

                      {task.dueDate && (
                        <Grid item xs={12} sm={6} md={6}>
                          <TextField
                            label="Due Date"
                            defaultValue={formatDateCustom(task.dueDate)}
                            size="small"
                            disabled
                            fullWidth
                          />
                        </Grid>
                      )}
                    </Grid>

                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 5 }} sx={{ width: "100%", height: "100%" }}>

                {/* Recurring Plan */}
                <RecurringPlanCard recurringPlan={recurringPlan} />
                {/* Habit Log */}
                <HabitStatsCard habitStats={habitStats} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
          </Box>
        </Card >
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleTaskEdit}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleTaskDelete}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Box >
    ) : null;
  }, [isLoading, error, task, handleBack, handleTaskEdit, handleTaskDelete]);

  const pageTitle = `Task ${taskId}`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: "Tasks", path: "/tasks/todo" }, { title: pageTitle }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>

          <Button
            variant="contained"
            // onClick={handleCreateClick}
            startIcon={<AddIcon />}
          >
            Add task Template
          </Button>
        </Stack>
      }
    >
      <Box sx={{ display: "flex", flex: 1, width: "100%" }}>{renderShow}</Box>
    </PageContainer>
  );

}
