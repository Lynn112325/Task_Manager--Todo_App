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

    // start_date
    if (required(task.start_date)) {
        pushIssue(issues, "start_date", "Start date is required");
    } else if (invalidDate(task.start_date)) {
        pushIssue(issues, "start_date", "Start date must be a valid date");
    }

    // due_date
    if (required(task.due_date)) {
        pushIssue(issues, "due_date", "Due date is required");
    } else if (invalidDate(task.due_date)) {
        pushIssue(issues, "due_date", "Due date must be a valid date");
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
