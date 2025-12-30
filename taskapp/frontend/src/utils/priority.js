export const PRIORITIES = [
    { value: 1, label: "Low" },
    { value: 2, label: "Medium" },
    { value: 3, label: "High" },
    { value: 4, label: "Critical" },
    { value: 5, label: "Urgent" },
];


export function getPriorityLabel(num) {
    const priority = PRIORITIES.find(p => p.value === Number(num));
    return priority ? priority.label : "Unknown";
}

export function getPriorityChipColor(priority) {
    const p = Number(priority);
    if (p === 3) return "warning";
    if (p >= 4) return "error";
    return "success";
}