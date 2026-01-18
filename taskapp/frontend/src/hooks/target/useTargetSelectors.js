import { useMemo } from "react";

export function useTargetSelectors(targets, type = "all") {
    const targetsFiltered = useMemo(() => {
        // if no target
        if (!Array.isArray(targets)) return [];

        return [...targets]
            .filter(t => type === "all" || t.type === type);
    }, [targets, type]);

    return { targetsFiltered };
}
