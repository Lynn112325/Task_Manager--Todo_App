import dayjs from "dayjs";

function required(value) {
    return value == null || String(value).trim() === "";
}

function invalidDate(value) {
    return isNaN(Date.parse(value));
}

function pushIssue(issues, path, message) {
    issues.push({ path: [path], message });
}

export function validateTask(task) {
    const issues = [];

    // title
    if (required(task.title)) {
        pushIssue(issues, "title", "Task title is required");
    }

    // startDate
    if (required(task.startDate)) {
        pushIssue(issues, "startDate", "Start date is required");
    } else if (invalidDate(task.startDate)) {
        pushIssue(issues, "startDate", "Start date must be a valid date");
    }

    // dueDate
    if (required(task.dueDate)) {
        pushIssue(issues, "dueDate", "Due date is required");
    } else if (invalidDate(task.dueDate)) {
        pushIssue(issues, "dueDate", "Due date must be a valid date");
    }

    // date logic
    if (task.startDate && task.dueDate) {
        const start = dayjs(task.startDate).startOf("day");
        const due = dayjs(task.dueDate).startOf("day");
        const today = dayjs().startOf("day");

        if (start.isBefore(today)) {
            pushIssue(issues, "startDate", "Start date cannot be in the past");
        }

        if (due.isBefore(start)) {
            pushIssue(issues, "dueDate", "Due date must be after Start date");
        }
    }

    // priority
    if (required(task.priority)) {
        pushIssue(issues, "priority", "Priority is required");
    } else if (![1, 2, 3, 4, 5].includes(task.priority)) {
        pushIssue(issues, "priority", "Priority value is invalid");
    }

    // type
    if (required(task.type)) {
        pushIssue(issues, "type", "Type is required");
    }

    return { issues };
}
