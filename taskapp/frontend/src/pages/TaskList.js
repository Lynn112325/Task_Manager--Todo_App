import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  Alert,
  Badge,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  List,
  ListSubheader,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import dayjs from "dayjs";
import * as React from "react";
import { useNavigate } from "react-router";
import MuiDatePicker from "../components/MuiDatePicker";
import PageContainer from "../components/PageContainer";
import { TaskFilterPopover } from "../components/Task/TaskFilterPopover";
import TaskListItems from "../components/TaskListItems";
import { useTasks } from "../hooks/task/useTasks";

export default function TaskList() {
  const [selectedDate, setSelectedDate] = React.useState(dayjs());
  const [listToggle, setListToggle] = React.useState("upcoming");
  const navigate = useNavigate();

  const {
    getTasksByDate,
    upcomingTasks,     // Memoized & Sorted from hook
    overdueTasks,      // Memoized & Sorted from hook
    isLoading,
    toggleTaskAction,
    error,
    filterProps,
    refreshAction
  } = useTasks(selectedDate);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const tasksByDate = React.useMemo(() => {
    return getTasksByDate(selectedDate);
  }, [getTasksByDate, selectedDate]);

  const sideListTasks = React.useMemo(() => {
    return listToggle === "upcoming" ? upcomingTasks : overdueTasks;
  }, [listToggle, upcomingTasks, overdueTasks]);

  const handleRefresh = () => {
    if (!isLoading) refreshAction();
  };

  const onStatusUpdate = React.useCallback(
    (task, newStatus) => {
      toggleTaskAction(task, newStatus);
    },
    [toggleTaskAction]
  );

  const handleRowView = React.useCallback(
    (task) => {
      navigate(`/tasks/${task.id}`);
    },
    [navigate]
  );

  const handleCreateClick = React.useCallback(() => {
    navigate("/tasks/new");
  }, [navigate]);

  const pageTitle = "Tasks";

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: pageTitle }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>

          <Tooltip title="Reload data" placement="top">

            <div>
              <IconButton
                size="small"
                aria-label="refresh"
                onClick={handleRefresh}
              >
                <RefreshIcon />
              </IconButton>
            </div>
          </Tooltip>

          <TaskFilterPopover {...filterProps} />

          <Button
            variant="contained"
            onClick={handleCreateClick}
            sx={{
              minWidth: { xs: '40px', sm: 'auto' },
              px: { xs: 0, sm: 2 },
            }}
          >
            <AddIcon sx={{ mr: { xs: 0, sm: 0.5 } }} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Create
            </Box>
          </Button>
        </ Stack>
      }
    >

      <Grid
        container
        columns={12}
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        sx={{ flex: 1 }}
      >

        <Grid
          size={{ xs: 12, sm: 12, md: 7 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            order: { xs: 1, md: 1 },
            mb: 2
          }}
        >

          {isLoading ? (
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
          ) : error ? (
            <Box sx={{ flexGrow: 1, width: "100%" }}>

              <Alert severity="error">{error.message}</Alert>
            </Box>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                borderRadius: "15px",
                bgcolor: "background.paper",
                width: "100%",
                boxShadow: 2,
              }}
            >
              {/* rendering a list of tasks grouped by date */}
              <List
                sx={{
                  flexGrow: 1,
                  bgcolor: "background.paper",
                  pb: 2,
                }}
                component="nav"
                aria-labelledby="DateTasks"
                subheader={
                  <ListSubheader component="div" id="DateTasks" sx={{ bgcolor: "background.paper" }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>
                        {dayjs(selectedDate).isSame(dayjs(), "day") ? "Today - " : ""}
                        {dayjs(selectedDate).format("YYYY-MM-DD (dddd)")}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Typography sx={{ whiteSpace: 'nowrap' }}>
                        {tasksByDate.length} task(s)
                      </Typography>
                    </Box>
                  </ListSubheader>
                }
              >

                <TaskListItems
                  rows={tasksByDate}
                  onStatusUpdate={onStatusUpdate}
                  onRowView={handleRowView}
                />

              </List>
            </Box>
          )}
        </Grid>
        <Grid
          size={{ xs: 12, sm: 12, md: 5 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            order: { xs: 2, md: 2 },
            mb: 2
          }}
        >
          <Box
            sx={{
              width: "100%",
              border: "1px solid divider",
              borderRadius: "15px",
            }}
          >

            <MuiDatePicker onDateChange={handleDateChange} />
          </Box>
          {/* Upcoming tasks / Overdue tasks */}
          <Box
            sx={{
              flexGrow: 1,
              width: "100%",
              border: "1px solid divider",
              borderRadius: "15px",
            }}
          >

            {isLoading ? (
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
            ) : error ? (
              <Box sx={{ flexGrow: 1, width: "100%" }}>

                <Alert severity="error">{error.message}</Alert>
              </Box>
            ) : (
              <Box
                sx={{
                  flexGrow: 1,
                  borderRadius: "15px",
                  bgcolor: "background.paper",
                  width: "100%",
                  boxShadow: 2,
                  height: "100%",
                }}
              >

                <List
                  sx={{
                    flexGrow: 1,
                    bgcolor: "background.paper",
                  }}
                  component="nav"
                  aria-labelledby="Upcoming_Tasks"
                  subheader={
                    <ListSubheader
                      component="div"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="subtitle2">
                        {listToggle === "upcoming"
                          ? "Upcoming Task(s)"
                          : "Overdue Task(s)"}
                      </Typography>
                      {/* List Toggle button */}
                      <Tooltip
                        title={
                          listToggle === "overdue"
                            ? "View Upcoming Task(s)"
                            : "View Overdue Task(s)"
                        }
                        placement="top"
                      >
                        <Badge
                          color={listToggle === "upcoming" ? "error" : "primary"}
                          badgeContent={listToggle === "upcoming" ? overdueTasks.length : upcomingTasks.length}
                          sx={{
                            "& .MuiBadge-badge": {
                              boxShadow: 1,
                            }
                          }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.currentTarget.blur();
                              requestAnimationFrame(() => {
                                setListToggle((prev) =>
                                  prev === "upcoming" ? "overdue" : "upcoming"
                                );
                              });
                            }}
                          >
                            <SwapHorizIcon fontSize="small" />
                          </IconButton>
                        </Badge>
                      </Tooltip>
                    </ListSubheader>
                  }
                >
                  <TaskListItems
                    rows={sideListTasks}
                    onStatusUpdate={onStatusUpdate}
                    onRowView={handleRowView}
                  />
                </List>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid >
    </PageContainer >
  );
}
