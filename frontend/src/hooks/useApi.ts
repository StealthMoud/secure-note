import { useState, useCallback, useRef, useEffect } from 'react';

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    initialData?: T | null;
    autoDismissDuration?: number; // duration in ms to clear message/error
}

export const useApi = <T>(options: UseApiOptions<T> = {}) => {
    const { onSuccess, onError, initialData = null, autoDismissDuration = 5000 } = options;

    const [data, setData] = useState<T | null>(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isExitingError, setIsExitingError] = useState(false);
    const [isExitingMessage, setIsExitingMessage] = useState(false);

    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const errorDismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messageDismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimeouts = useCallback(() => {
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
        if (errorDismissTimeoutRef.current) clearTimeout(errorDismissTimeoutRef.current);
        if (messageDismissTimeoutRef.current) clearTimeout(messageDismissTimeoutRef.current);
    }, []);

    const dismissError = useCallback(() => {
        setIsExitingError(true);
        errorDismissTimeoutRef.current = setTimeout(() => {
            setError(null);
            setIsExitingError(false);
        }, 500);
    }, []);

    const dismissMessage = useCallback(() => {
        setIsExitingMessage(true);
        messageDismissTimeoutRef.current = setTimeout(() => {
            setMessage(null);
            setIsExitingMessage(false);
        }, 500);
    }, []);

    const execute = useCallback(
        async (apiCall: () => Promise<T>, successMsg?: string) => {
            setLoading(true);
            setError(null);
            setMessage(null);
            setIsExitingError(false);
            setIsExitingMessage(false);
            clearTimeouts();

            try {
                const result = await apiCall();
                setData(result);
                if (successMsg) {
                    setMessage(successMsg);
                    messageTimeoutRef.current = setTimeout(dismissMessage, autoDismissDuration);
                }
                if (onSuccess) onSuccess(result);
                return result;
            } catch (err: any) {
                const errorMsg = err.message || 'An unexpected error occurred';
                setError(errorMsg);
                errorTimeoutRef.current = setTimeout(dismissError, autoDismissDuration);
                if (onError) onError(err);
                return undefined;
            } finally {
                setLoading(false);
            }
        },
        [onSuccess, onError, autoDismissDuration, dismissError, dismissMessage]
    );

    useEffect(() => {
        return () => clearTimeouts();
    }, []);

    return {
        data,
        setData,
        loading,
        setLoading,
        error,
        setError,
        message,
        setMessage,
        isExitingError,
        isExitingMessage,
        dismissError,
        dismissMessage,
        execute,
    };
};
