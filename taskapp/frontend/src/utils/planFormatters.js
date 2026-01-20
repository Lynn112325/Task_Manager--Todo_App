import dayjs from "dayjs";

export const formatDateCustom = (dateStr) => {
    if (!dateStr) return 'No date';
    return dayjs(dateStr).format("YYYY/MM/DD (ddd)");
};

export const formatFrequency = (plan) => {
    if (!plan) return "Not Scheduled";
    const t = plan.recurrenceType;
    if (t === "DAILY") return "Every day";

    if (t === "NONE") return "NONE";

    const interval = plan.recurrenceInterval === 1 ? "" : plan.recurrenceInterval;
    const base = t === "WEEKLY" ? "week"
        : t === "MONTHLY" ? "month"
            : t === "YEARLY" ? "year"
                : t?.toLowerCase();

    let weekDays = "";
    if (plan.recurrenceDays && plan.recurrenceDays.length > 0) {
        weekDays = " on " + plan.recurrenceDays
            .map(d => d.substring(0, 3).charAt(0) + d.substring(1, 3).toLowerCase())
            .join(", ");
    }

    const s = plan.recurrenceInterval > 1 ? "s" : "";
    return `Every ${interval} ${base}${s}${weekDays}`;
};

export const getPlanPeriodLabel = (plan, status) => {
    if (status == "MANUAL_TRIGGER") {
        return "Smart Template (Manual/Auto)";
    }
    const start = plan?.recurrenceStart;
    const end = plan?.recurrenceEnd;
    const format = (d) => dayjs(d).format("YYYY/MM/DD");

    if (status === "PAUSED") return "Currently Paused";
    if (status === "COMPLETED") return end ? `Ended on ${format(end)}` : "Completed";
    if (status === "UPCOMING") return `Starts ${format(start)}`;

    if (!start && !end) return "Active Continuous Plan";
    if (start && !end) return `Active since ${format(start)}`;

    return `${format(start)} — ${format(end)}`;
};