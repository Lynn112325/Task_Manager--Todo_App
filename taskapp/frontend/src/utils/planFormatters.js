import dayjs from "dayjs";

export const formatDateCustom = (dateStr) => {
    if (!dateStr) return 'No date';
    return dayjs(dateStr).format("YYYY/MM/DD (ddd)");
};

/**
 * 取得數字的序數後綴 (1st, 2nd, 3rd, 4th...)
 */
const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/**
 * Formats the recurrence frequency into a human-readable English string.
 *
 * @param {string} recurrenceType - The type of recurrence (e.g., 'DAILY', 'WEEKLY', 'MONTHLY', 'NONE').
 * @param {number} [recurrenceInterval=1] - The interval between recurrences (e.g., 2 for "every 2 weeks").
 * @param {string[]} [recurrenceDays=[]] - Array of day abbreviations for weekly recurrence (e.g., ['Mon', 'Tue']).
 * @param {string|null} [recurrenceStart=null] - The start date in ISO format, used for determining the day of the month for monthly recurrence.
 * @returns {string} A formatted human-readable string (e.g., "Every 2 months on the 15th") or an empty string if NONE.
 */
export const formatFrequency = (recurrenceType, recurrenceInterval = 1, recurrenceDays = [], recurrenceStart = null) => {
    if (!recurrenceType || recurrenceType === "NONE") return "";

    const intervalStr = recurrenceInterval > 1 ? `${recurrenceInterval} ` : "";

    // Helper function to get ordinal suffix (1st, 2nd, 3rd, 4th...)
    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"],
            v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    // 1. DAILY
    if (recurrenceType === "DAILY") {
        return recurrenceInterval === 1 ? "Every day" : `Every ${recurrenceInterval} days`;
    }

    // 2. WEEKLY
    if (recurrenceType === "WEEKLY") {
        const unit = recurrenceInterval > 1 ? "weeks" : "week";
        let days = "";
        if (recurrenceDays?.length > 0) {
            days = " on " + recurrenceDays
                .map(d => d.charAt(0).toUpperCase() + d.substring(1, 3).toLowerCase())
                .join(", ");
        }
        return `Every ${intervalStr}${unit}${days}`;
    }

    // 3. MONTHLY (Uses RecurrenceStart to determine the day)
    if (recurrenceType === "MONTHLY") {
        const unit = recurrenceInterval > 1 ? "months" : "month";
        let dayDetail = "";

        if (recurrenceStart) {
            const dateObj = new Date(recurrenceStart);
            if (!isNaN(dateObj.getTime())) {
                const day = dateObj.getDate();
                dayDetail = ` on the ${getOrdinal(day)}`;
            }
        }

        return `Every ${intervalStr}${unit}${dayDetail}`;
    }

    // Fallback for other types
    return `Every ${intervalStr}${recurrenceType.toLowerCase()}`;
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