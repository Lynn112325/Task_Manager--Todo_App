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

/**
 * Generates a user-friendly display label for the blueprint's timeframe.
 * @param {Object} plan - Plan object containing recurrenceStart and recurrenceEnd.
 * @param {string} status - Blueprint status (MANUAL_TRIGGER, PAUSED, COMPLETED, etc.)
 */
export const getPlanPeriodLabel = (plan, status) => {
    const start = plan?.recurrenceStart;
    const end = plan?.recurrenceEnd;

    // Helper: format dates using custom utility or fallback to raw string
    const format = (d) => (typeof formatDateCustom === 'function' ? formatDateCustom(d) : d);
    const dateRange = (s, e) => `${format(s)} — ${format(e)}`;

    // Handle static, non-recurring templates
    if (status === "MANUAL_TRIGGER") {
        if (start || end) {
            if (start && end) return dateRange(start, end);
            return start ? `Scheduled: ${format(start)}` : `Deadline: ${format(end)}`;
        }
        return "Smart Template (Manual)";
    }

    // Handle recurring plan life cycles
    switch (status) {
        case "PAUSED":
            return "Currently Paused";

        case "COMPLETED":
            return end
                ? `Blueprint cycle ended on ${format(end)}`
                : "Execution Completed";

        case "UPCOMING":
            return start
                ? `Scheduled to start ${format(start)}`
                : "Upcoming Plan";

        case "ONGOING":
        default:
            // Display active date ranges or start/end points
            if (start && end) return dateRange(start, end);
            if (start) return `Active since ${format(start)}`;
            if (end) return `Ends on ${format(end)}`;

            return "Active Continuous Blueprint";
    }
};