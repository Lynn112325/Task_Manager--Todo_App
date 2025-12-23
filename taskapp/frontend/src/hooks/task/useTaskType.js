import React from "react";

export function useTaskType() {
    const currentHour = new Date().getHours();
    const initialType = currentHour >= 9 && currentHour < 17 ? "work" : "all";

    const [type, setType] = React.useState(initialType);

    const handleTypeChange = (event) => {
        setType(event.target.value);
        console.log("Task type changed to:", event.target.value);
    };

    React.useEffect(() => {
        const interval = setInterval(() => {
            const hour = new Date().getHours();
            setType(hour >= 9 && hour < 17 ? "work" : "all");
        }, 60 * 1000); // check every minute

        return () => clearInterval(interval);
    }, []);

    return { type, handleTypeChange };
}
