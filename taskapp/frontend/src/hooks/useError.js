export function useError() {
    
    function getUserFriendlyError(err) {
        if (err.response?.data?.message) {
            return err.response.data.message;
        }

        if (typeof err.response?.data === "string") {
            return err.response.data;
        }

        // Axios error codes
        if (err.code === "ERR_NETWORK") {
            return "Unable to connect to the server. Please check your internet connection.";
        }

        // timeout
        if (err.code === "ECONNABORTED") {
            return "Request timed out. Please try again.";
        }

        // HTTP status codes
        if (err.response?.status === 400) {
            return "Bad request. Please check the data you provided.";
        }
        if (err.response?.status === 404) {
            return "The requested item could not be found.";
        }

        if (err.response?.status === 500) {
            return "Server encountered an error. Please try again later.";
        }

        // fallback
        return "Something went wrong. Please try again.";
    }
    return { getUserFriendlyError };
}