import { useMemo, useState } from 'react';

export function useTaskScheduleFilters(taskSchedules = []) {
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ONGOING, UPCOMING, PAUSED, COMPLETED
    const [filterType, setFilterType] = useState('ALL');     // ALL, DAILY, WEEKLY, MONTHLY, NONE
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAndSortedSchedules = useMemo(() => {

        const filtered = taskSchedules.filter(item => {
            const rp = item.recurringPlan;

            const matchesType =
                filterType === 'ALL' ? true :
                    item.recurringPlan?.recurrenceType === filterType;

            const matchesStatus =
                filterStatus === 'ALL' ? true :
                    rp?.displayStatus === filterStatus;

            const matchesSearch =
                item.taskTemplate.title.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesStatus && matchesType && matchesSearch;
        });

        // Sorting Logic
        return [...filtered].sort((a, b) => {
            const planA = a.recurringPlan;
            const planB = b.recurringPlan;
            const templateA = a.taskTemplate;
            const templateB = b.taskTemplate;

            // sort by status order
            const statusOrder = { 'ONGOING': 1, 'UPCOMING': 2, 'PAUSED': 3, 'MANUAL_TRIGGER': 4, 'COMPLETED': 5 };
            if (statusOrder[planA.displayStatus] !== statusOrder[planB.displayStatus]) {
                return statusOrder[planA.displayStatus] - statusOrder[planB.displayStatus];
            }

            // sort by priority
            if (templateA?.priority !== templateB?.priority) {
                return (templateB?.priority || 0) - (templateA?.priority || 0);
            }

            // sort by title alphabetically
            return templateA.title.localeCompare(templateB.title);
        });
    }, [taskSchedules, filterStatus, filterType, searchTerm]);

    const handleClearFilters = () => {
        setFilterStatus('ALL');
        setFilterType('ALL');
        setSearchTerm('');
    };

    const activeFilterCount = [
        filterStatus !== 'ALL',
        filterType !== 'ALL',
        searchTerm !== ''
    ].filter(Boolean).length;

    return {
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,
        searchTerm,
        setSearchTerm,
        activeFilterCount,
        handleClearFilters,
        filteredSchedules: filteredAndSortedSchedules,
        hasActiveFilters: activeFilterCount > 0
    };
}