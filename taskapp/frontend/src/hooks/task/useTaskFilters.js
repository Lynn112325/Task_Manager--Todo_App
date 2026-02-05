import { useCallback, useState } from 'react';

/**
 * The `useTaskFilters` function in JavaScript manages task filtering options including status, type,
 * search term, and clearing filters.
 * @returns The `useTaskFilters` function returns an object with the following properties and methods:
 */
export function useTaskFilters() {

    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ACTIVE, COMPLETED, CANCELED
    const [filterType, setFilterType] = useState('all');   // all, work, life, study, shopping..
    const [searchTerm, setSearchTerm] = useState('');

    // Clear Filter
    const handleClearFilters = useCallback(() => {
        setFilterStatus('ALL');
        setFilterType('all');
        setSearchTerm('');
    }, []);

    // calculating the number of active filters currently applied
    const activeFilterCount = [
        filterStatus !== 'ALL',
        filterType !== 'all',
        searchTerm !== ''
    ].filter(Boolean).length;

    const hasActiveFilters = activeFilterCount > 0;

    return {
        // status
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,
        searchTerm,
        setSearchTerm,

        // info
        activeFilterCount,
        hasActiveFilters,
        handleClearFilters
    };
}