import { useTargetsData } from "./useTargetsData";
import { useTargetSelectors } from "./useTargetSelectors";


export function useTarget(type = "all") {
    // Data
    const {
        targets,
        isLoading,
        error,
        getTargetById,
        createTarget,
        updateTarget,
        deleteTarget,
        fetchTargets, // unimplemented
    } = useTargetsData();

    // Actions
    // const actions = useTargetActions({
    //     createTarget,
    //     updateTarget,
    //     deleteTarget,
    // });

    // Selectors
    const selectors = useTargetSelectors(targets, type);

    return {
        // data
        targets: selectors.targetsFiltered,
        isLoading,
        error,

        // actions
        // ...actions,

        // derived
        // ...selectors,

        // raw access
        refresh: fetchTargets,
        getTargetById,
    };
}
