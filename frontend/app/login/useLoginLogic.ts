'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser, initiateOAuthLogin, loginUser, verifyTotpLogin } from '@/services/auth';
import { useDashboardSharedContext } from '@/app/context/DashboardSharedContext';

export function useLoginLogic() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { setUser } = useDashboardSharedContext();
    const token = searchParams.get('token');

    const [identifier, setIdentifier] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [totpCode, setTotpCode] = useState<string>('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requires2FA, setRequires2FA] = useState(false);
    const [tempToken, setTempToken] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fieldErrorVisibility, setFieldErrorVisibility] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isExitingError, setIsExitingError] = useState(false);
    const [isExitingMessage, setIsExitingMessage] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!identifier) newErrors.identifier = 'Email or Username is required';
        if (!password) newErrors.password = 'Password is required';
        if (requires2FA && !totpCode) newErrors.totpCode = '2FA code is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const visibility: Record<string, boolean> = {};
            Object.keys(newErrors).forEach((field) => {
                visibility[field] = true;
                setTimeout(() => {
                    setFieldErrorVisibility((prev) => ({ ...prev, [field]: false }));
                    setTimeout(() => {
                        setErrors((prev) => {
                            const updatedErrors = { ...prev };
                            delete updatedErrors[field];
                            return updatedErrors;
                        });
                    }, 500);
                }, 3000);
            });
            setFieldErrorVisibility(visibility);
        }
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setError('');
        setMessage('');
        setFieldErrorVisibility({});
        setIsExitingError(false);
        setIsExitingMessage(false);
        setLoading(true);

        try {
            if (!requires2FA) {
                const data = await loginUser(identifier, password);
                if (data.requires2FA) {
                    setRequires2FA(true);
                    setTempToken(data.tempToken ?? null);
                    setMessage('Please enter your 2FA code.');
                    setTimeout(() => {
                        setIsExitingMessage(true);
                        setTimeout(() => setMessage(''), 500);
                    }, 3000);
                    setLoading(false);
                    return;
                }
                localStorage.setItem('token', data.token!);
                const userData = await getCurrentUser(data.token!) ;
                setUser(userData);
                if (rememberMe) localStorage.setItem('rememberMe', 'true');
                setMessage('Login successful! Redirecting...');
                setTimeout(() => {
                    setIsExitingMessage(true);
                    setTimeout(() => {
                        setMessage('');
                        router.push('/dashboard');
                    }, 500);
                }, 2000);
            } else {
                if (!tempToken) throw new Error('Temporary token missing');
                const response = await verifyTotpLogin(tempToken, totpCode);
                localStorage.setItem('token', response.token);
                const userData = await getCurrentUser(response.token);
                setUser(userData);
                if (rememberMe) localStorage.setItem('rememberMe', 'true');
                setMessage('Login successful! Redirecting...');
                setTimeout(() => {
                    setIsExitingMessage(true);
                    setTimeout(() => {
                        setMessage('');
                        router.push('/dashboard');
                    }, 500);
                }, 2000);
            }
        } catch (err: any) {
/*
            console.error('Login Error:', err); // Keep for debugging
*/
            if (err.fieldErrors && Object.keys(err.fieldErrors).some(key => key !== 'undefined')) {
                // Handle field-specific errors only if they have valid field names
                setErrors(err.fieldErrors);
                const visibility: Record<string, boolean> = {};
                Object.keys(err.fieldErrors).forEach((field) => {
                    if (field !== 'undefined') { // Skip undefined keys
                        visibility[field] = true;
                        setTimeout(() => {
                            setFieldErrorVisibility((prev) => ({ ...prev, [field]: false }));
                            setTimeout(() => {
                                setErrors((prev) => {
                                    const newErrors = { ...prev };
                                    delete newErrors[field];
                                    return newErrors;
                                });
                            }, 500);
                        }, 3000);
                    }
                });
                setFieldErrorVisibility(visibility);
            }

            // Handle general errors (including "Invalid credentials")
            const generalError =
                err.fieldErrors?.undefined || // If undefined key exists, use it as general error
                err.response?.data?.error ||
                err.message ||
                'Invalid credentials or something went wrong. Please try again.';
            setError(generalError);
            setTimeout(() => {
                setIsExitingError(true);
                setTimeout(() => setError(''), 500);
            }, 3000); // Error shows for 3 seconds
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        try {
            setLoading(true);
            await initiateOAuthLogin(provider);
        } catch (err: any) {
            const errorMessage = err.message || `Failed to initiate ${provider} login`;
            setError(errorMessage);
            setTimeout(() => {
                setIsExitingError(true);
                setTimeout(() => setError(''), 500);
            }, 3000);
            setLoading(false);
        }
    };

    const dismissFieldError = (field: string) => {
        setFieldErrorVisibility((prev) => ({ ...prev, [field]: false }));
        setTimeout(() => {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }, 500);
    };

    useEffect(() => {
        document.title = 'Login | Secure Note';
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            setMessage('OAuth login successful! Redirecting...');
            getCurrentUser(token)
                .then((userData) => {
                    setUser(userData);
                    setTimeout(() => {
                        setIsExitingMessage(true);
                        setTimeout(() => {
                            setMessage('');
                            router.push('/dashboard');
                        }, 500);
                    }, 2000);
                })
                .catch((err) => {
                    setError('Failed to fetch user after OAuth login');
                    console.error(err);
                    setTimeout(() => {
                        setIsExitingError(true);
                        setTimeout(() => setError(''), 500);
                    }, 3000);
                });
        }
    }, [token, router, setUser]);

    return {
        identifier,
        setIdentifier,
        password,
        setPassword,
        totpCode,
        setTotpCode,
        rememberMe,
        setRememberMe,
        showPassword,
        setShowPassword,
        loading,
        requires2FA,
        errors,
        fieldErrorVisibility,
        error,
        message,
        isExitingError,
        isExitingMessage,
        handleLogin,
        handleOAuthLogin,
        dismissFieldError,
    };
}