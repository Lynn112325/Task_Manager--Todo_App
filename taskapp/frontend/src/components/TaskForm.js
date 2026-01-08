import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from '@mui/material/Divider';
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import * as React from "react";
import { useNavigate } from "react-router";
import { PRIORITIES } from "../utils/priority.js";
import { TYPES } from "../utils/types.js";
import StyledTextarea from "./StyledTextarea";
import TaskTypeIcon from "./TaskTypeIcon";

function TaskForm(props) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onReset,
    submitButtonLabel,
    backButtonPath,
  } = props;

  const formValues = formState.values;
  // console.log("formValues:", formValues);
  const formErrors = formState.errors;

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (event) => {
      event.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit(formValues);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formValues, onSubmit]
  );

  const handleTextFieldChange = React.useCallback(
    (event) => {
      onFieldChange(event.target.name, event.target.value);
    },
    [onFieldChange]
  );

  const handleDateFieldChange = (fieldName) => (value) => {
    onFieldChange(fieldName, value ? value.toISOString() : null);
  };

  const handleSelectFieldChange = React.useCallback(
    (event) => {
      onFieldChange(event.target.name, event.target.value);
    },
    [onFieldChange]
  );

  const handleReset = React.useCallback(() => {
    if (onReset) {
      onReset(formValues);
    }
  }, [formValues, onReset]);

  const handleBack = React.useCallback(() => {
    navigate(backButtonPath ?? "/tasks/todo");
  }, [navigate, backButtonPath]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      onReset={handleReset}
      sx={{ width: "100%", height: "100%" }}
    >
      <FormGroup sx={{ minHeight: "460px" }}>
        <Grid container spacing={1} sx={{ mb: 2, width: "100%" }}>
          {/* Title */}
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.title ?? ""}
              onChange={handleTextFieldChange}
              name="title"
              label="Title"
              error={!!formErrors.title}
              helperText={formErrors.title ?? " "}
              fullWidth
            />
          </Grid>

          {/* Priority */}
          <Grid size={{ xs: 12, sm: 3 }} sx={{ display: "flex" }}>
            <FormControl error={!!formErrors.priority} fullWidth>
              <InputLabel id="task-priority-label">Priority</InputLabel>
              <Select
                value={formValues.priority ?? ""}
                onChange={handleSelectFieldChange}
                labelId="task-priority-label"
                name="priority"
                label="Priority"
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p.value} value={p.value} >
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{formErrors.priority ?? " "}</FormHelperText>
            </FormControl>
          </Grid>
          {/* Type */}
          <Grid size={{ xs: 12, sm: 3 }} sx={{ display: "flex" }}>
            <FormControl error={!!formErrors.type} fullWidth>
              <InputLabel id="task-type-label">Type</InputLabel>
              <Select
                name="type"
                label="Type"
                onChange={handleSelectFieldChange}
                value={formValues.type}
                displayEmpty
                inputProps={{ "aria-label": "Task type selector" }}
                sx={{ flex: 1, minWidth: 150 }}
              >
                {TYPES.map((taskType) => (
                  <MenuItem key={taskType} value={taskType}>
                    <TaskTypeIcon type={taskType} sx={{ mr: 1 }} />
                    {taskType}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{formErrors.type ?? " "}</FormHelperText>
            </FormControl>
          </Grid>

          {/* Date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", mb: 2 }}>
              <DatePicker
                name="startDate"
                label="Start Date"
                // defaultValue={}
                value={
                  formValues.startDate ? dayjs(formValues.startDate) : null
                }
                onChange={handleDateFieldChange("startDate")}
                slotProps={{
                  textField: {
                    error: !!formErrors.startDate,
                    helperText: formErrors.startDate || " ",
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", mb: 2 }}>
              <DatePicker
                value={formValues.dueDate ? dayjs(formValues.dueDate) : null}
                onChange={handleDateFieldChange("dueDate")}
                name="dueDate"
                label="Due date"
                slotProps={{
                  textField: {
                    error: !!formErrors.dueDate,
                    helperText: formErrors.dueDate || " ",
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
          </LocalizationProvider>
          {/* Description */}
          <Grid size={{ xs: 12, sm: 12 }} sx={{ display: "flex" }}>
            <StyledTextarea
              value={formValues.description ?? ""}
              readOnly={false}
              onChange={handleTextFieldChange}
              name="description"
              label="Description"
              placeholder=""
              error={!!formErrors.description}
              helperText={formErrors.description ?? " "}
              fullWidth
            />
          </Grid>
        </Grid>
      </FormGroup>
      <Divider />
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 2 }}>
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
            size="large"
            type="reset"
            onClick={handleReset}
          >
            <RefreshIcon />
          </Button>

          <Button
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting}
          >
            {submitButtonLabel}
          </Button>
        </Stack>
      </Stack>

    </Box>
  );
}

TaskForm.propTypes = {
  backButtonPath: PropTypes.string,
  formState: PropTypes.shape({
    errors: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      type: PropTypes.string,
      startDate: PropTypes.string,
      dueDate: PropTypes.string,
      priority: PropTypes.string,
    }).isRequired,
    values: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      type: PropTypes.string,
      startDate: PropTypes.string,
      dueDate: PropTypes.string,
      priority: PropTypes.number,
    }).isRequired,
  }).isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onReset: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  submitButtonLabel: PropTypes.string.isRequired,
};

export default TaskForm;
