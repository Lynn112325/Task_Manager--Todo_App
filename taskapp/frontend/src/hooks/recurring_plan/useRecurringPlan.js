import { useRecurringPlansData } from "./useRecurringPlansData";
// import { useRecurringPlanSelectors } from "./useRecurringPlanSelectors";


export function useRecurringPlan(targetId = null) {
    // Data
    const {
        recurringPlans,
        isLoading,
        error,
        getRecurringPlanById,
        // createRecurringPlan,
        // updateRecurringPlan,
        // deleteRecurringPlan,
        fetchRecurringPlans,
    } = useRecurringPlansData(targetId);

    // Actions
    // const actions = useRecurringPlanActions({
    //     createRecurringPlan,
    //     updateRecurringPlan,
    //     deleteRecurringPlan,
    // });

    // Selectors
    // const selectors = useRecurringPlanSelectors(recurringPlans, type);

    return {
        // data
        recurringPlans,
        // : selectors.recurringPlansFiltered,
        isLoading,
        error,

        // actions
        // ...actions,

        // derived
        // ...selectors,

        // raw access
        refresh: fetchRecurringPlans,
        getRecurringPlanById,
    };
}
