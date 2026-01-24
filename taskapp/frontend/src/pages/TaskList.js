import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  List,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import dayjs from "dayjs";
import * as React from "react";
import { useNavigate } from "react-router";
import MuiDatePicker from "../components/MuiDatePicker";
import PageContainer from "../components/PageContainer";
import TaskListItems from "../components/TaskListItems";
import TaskTypeSelector from "../components/TaskTypeSelector";
import { useTasks } from "../hooks/task/useTasks";
import { useType } from "../hooks/type/useType";

export default function TaskList() {
  const [selectedDate, setSelectedDate] = React.useState(dayjs());
  const [statusFilter, setStatusFilter] = React.useState("ACTIVE");
  const [listToggle, setListToggle] = React.useState("upcoming");

  const { type, handleTypeChange } = useType();

  const {
    // tasks,
    checked,
    getTasksByDate,
    getUpcomingTasks,
    getOverdueTasks,
    toggleTaskAction,
    fetchTasks,
    isLoading,
    error,
    refresh,
  } = useTasks(type);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const navigate = useNavigate();

  const tasksByDate = React.useMemo(() => {
    const rawTasks = getTasksByDate(selectedDate);
    return rawTasks.filter(task => task.status === statusFilter);
  }, [getTasksByDate, selectedDate, statusFilter, type]);

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const upcomingTasks = React.useMemo(
    () => getUpcomingTasks(),
    [getUpcomingTasks, type]
  );

  const overdueTasks = React.useMemo(
    () => getOverdueTasks(),
    [getOverdueTasks, type]
  );

  const sideListTasks = listToggle === "upcoming"
    ? upcomingTasks
    : overdueTasks;

  const handleRefresh = () => {
    if (!isLoading) refresh();
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

          <Select
            name="status"
            label="Status"
            value={statusFilter}
            displayEmpty
            inputProps={{ "aria-label": "Status selector" }}
            sx={{ flex: 1, minWidth: 150 }}
            onChange={handleStatusChange}
          >
            <MenuItem key="ACTIVE" value="ACTIVE">
              Ongoing
            </MenuItem>
            <MenuItem key="COMPLETED" value="COMPLETED">
              Completed
            </MenuItem>
            <MenuItem key="CANCELED" value="CANCELED">
              Discarded
            </MenuItem>
          </Select>

          <TaskTypeSelector
            type={type}
            handleTypeChange={handleTypeChange}
          />
          <Button
            variant="contained"
            onClick={handleCreateClick}
            startIcon={<AddIcon />}
          >
            Create
          </Button>
        </Stack>
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
          size={{ xs: 12, md: 7 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            order: { xs: 1, md: 1 },
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

              <List
                sx={{
                  width: "100%",
                  flexGrow: 1,
                  bgcolor: "background.paper",
                  height: "100%",
                }}
                component="nav"
                aria-labelledby="DateTasks"
                subheader={
                  <ListSubheader component="div" id="DateTasks">

                    <Typography variant="subtitle2">

                      {dayjs(selectedDate).isSame(dayjs(), "day")
                        ? "Today "
                        : ""}
                      {dayjs(selectedDate).format("YYYY-MM-DD (dddd)")}
                    </Typography>
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
          size={{ xs: 12, md: 5 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            order: { xs: 2, md: 2 },
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
                    width: "100%",
                    flexGrow: 1,
                    bgcolor: "background.paper",
                    height: "100%",
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
                      </Tooltip>
                    </ListSubheader>
                  }
                >
                  <TaskListItems
                    rows={sideListTasks}
                    checked={checked}
                    onStatusUpdate={onStatusUpdate}
                    onRowView={handleRowView}
                  />
                </List>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
