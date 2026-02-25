import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from "@mui/icons-material/Edit";
import RepeatIcon from '@mui/icons-material/Repeat';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Chip } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { Grid } from "@mui/system";
import * as React from "react";
import { useNavigate, useParams } from "react-router";
import { useLocation } from "react-router-dom";
import HabitStatsCard from "../components/HabitStatsCard.js";
import PageContainer from "../components/PageContainer";
import RecurringPlanCard from "../components/RecurringPlanCard.js";
import TaskCard from '../components/TaskCard.js';
import { useTaskDetail } from "../hooks/task/useTaskDetail.js";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "In Progress",
    color: "warning",
    icon: <ScheduleIcon />,
  },
  COMPLETED: {
    label: "Completed",
    color: "success",
    icon: <CheckCircleIcon />,
  },
  CANCELED: {
    label: "Canceled",
    color: "error",
    icon: <CancelIcon />,
  }
};

export default function TaskShow() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    detail: taskData,
    isLoading,
    isError,
    error
  } = useTaskDetail(taskId);


  const task = taskData?.task;
  const recurringPlan = taskData?.recurringPlan;
  const habitStats = taskData?.habitStats;
  const targetTitle = taskData?.target?.title;
  const config = task?.status
    ? (STATUS_CONFIG[task.status] || STATUS_CONFIG.ACTIVE)
    : STATUS_CONFIG.ACTIVE;

  const handleTaskEdit = React.useCallback(() => {
    if (!taskData?.task) return;

    navigate(`/tasks/${taskId}/edit`, {
      state: { task: task },
    });
  }, [navigate, taskId, taskData]);

  // const handleTaskDelete = React.useCallback(async () => {
  //   if (!taskData?.task) return;

  //   const success = await cancelTaskAction(task);
  //   if (success) {
  //     navigate("/tasks/todo");
  //   }
  // }, [taskData, cancelTaskAction, navigate]);

  const fromPath = location.state?.from || "/tasks/todo";
  const fromTitle = location.state?.fromTitle || "Tasks";

  const handleBack = React.useCallback(() => {
    navigate(fromPath);
  }, [navigate, fromPath]);

  const renderShow = React.useMemo(() => {
    if (!taskData && isLoading) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
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
        <Card variant="outlined" sx={{
          width: "100%", boxShadow: 2, minHeight: "80%", display: 'flex', flexDirection: 'column'
        }}>
          <Box sx={{
            p: 2,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>

            <Grid container spacing={2}>
              <Grid
                size={{ xs: 12, sm: 12, md: 7 }}
                sx={{ display: "flex", flexGrow: 1 }}
              >
                <TaskCard task={taskData.task} />
              </Grid>

              <Grid
                size={{ xs: 12, sm: 12, md: 5 }}
                sx={{ display: "flex", flexDirection: "column" }}
              >
                <RecurringPlanCard recurringPlan={recurringPlan} targetTitle={targetTitle} />
                <Grid sx={{ height: 14 }} />
                <HabitStatsCard habitStats={habitStats} isHabit={recurringPlan?.isHabit} />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 'auto', pt: 2, pb: 1 }}>
              <Chip
                size="medium"
                icon={config.icon}
                label={config.label}
                color={config.color}
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Stack>
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
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleTaskEdit}
            >
              Edit
            </Button>
          </Stack>
        </Stack>
      </Box >
    ) : null;
  }, [isLoading, error, task, handleBack, handleTaskEdit /*, handleTaskDelete*/]);

  const pageTitle = `Task ${taskId}`;
  const breadcrumbs = [
    { title: fromTitle, path: fromPath },
    { title: pageTitle }
  ];

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={breadcrumbs}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>

          {/* if no template id, show this btn (unimplemented) */}
          <Tooltip
            title="Reuse this task to quickly create repeated or scheduled tasks"
          >
            <Button startIcon={<RepeatIcon />}
              variant="contained"
            // onClick={handleTemplateAdd}
            >
              Save as Template
            </Button>
          </Tooltip>

        </ Stack>
      }
    >
      <Box sx={{ display: "flex", flex: 1, width: "100%" }}>{renderShow}</Box>
    </PageContainer>
  );

}
