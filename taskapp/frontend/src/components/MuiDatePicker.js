import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import * as React from "react";

export default function MuiDatePicker({ onDateChange }) {
  const [value, setValue] = React.useState(dayjs());
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Date Picker"
        value={value}
        format="YYYY/MM/DD (dddd)"
        onChange={(newValue) => {
          setValue(newValue);
          const formattedDate = newValue;
          // call the parent component's onDateChange method with the formatted date
          if (onDateChange) {
            onDateChange(formattedDate);
          }
        }}
        sx={{ width: '100%' }}
      />
    </LocalizationProvider>
  );
}
