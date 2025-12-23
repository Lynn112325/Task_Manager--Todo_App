export function validateTask(task) {
    const issues = [];

    if (!task.title?.trim()) {
        issues.push({
            message: "Task title is required",
            path: ["title"],
        });
    }

    if (!task.description?.trim()) {
        issues.push({
            message: "Task description is required",
            path: ["description"],
        });
    }

    if (!task.due_date) {
        issues.push({
            message: "Due date is required",
            path: ["due_date"],
        });
    } else if (isNaN(Date.parse(task.due_date))) {
        issues.push({
            message: "Due date must be a valid date",
            path: ["due_date"],
        });
    }

    if (task.priority == null) {
        issues.push({
            message: "Priority is required",
            path: ["priority"],
        });
    } else if (![1, 2, 3, 4, 5].includes(task.priority)) {
        issues.push({
            message: "Priority must be between 1 and 5",
            path: ["priority"],
        });
    }

    return { issues };
}
