// utils/priority.js
export const priorityLabels = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Critical",
    5: "Urgent",
};

export function getPriorityLabel(priority) {
    return priorityLabels[Number(priority)] || "Unknown";
}

export function getPriorityColor(priority) {
    const p = Number(priority);
    if (p === 3) return "warning";
    if (p >= 4) return "error";
    return "success";
}