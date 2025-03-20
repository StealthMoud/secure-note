'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { requestPasswordReset, resetPassword } from '@/services/auth';

export function useForgotPasswordLogic() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [email, setEmail] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fieldErrorVisibility, setFieldErrorVisibility] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isExitingError, setIsExitingError] = useState(false);
    const [isExitingMessage, setIsExitingMessage] = useState(false);

    const validateRequestForm = () => {
        const newErrors: Record<string, string> = {};
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

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

    const validateResetForm = () => {
        const newErrors: Record<string, string> = {};
        if (!newPassword) newErrors.newPassword = 'Password is required';
        else if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
        if (!confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
        else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

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

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateRequestForm()) return;

        setError('');
        setMessage('');
        setFieldErrorVisibility({});
        setLoading(true);

        try {
            const data = await requestPasswordReset(email);
            setMessage(data.message || 'Password reset email sent! Check your inbox.');
        } catch (err: any) {
            if (err.fieldErrors) {
                setErrors(err.fieldErrors);
                const visibility: Record<string, boolean> = {};
                Object.keys(err.fieldErrors).forEach((field) => {
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
                });
                setFieldErrorVisibility(visibility);
            } else {
                setError(err.message || 'Failed to request password reset');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateResetForm() || !token) return;

        setError('');
        setMessage('');
        setFieldErrorVisibility({});
        setLoading(true);

        try {
            const data = await resetPassword(token, newPassword);
            setMessage(data.message || 'Password reset successful! Redirecting to login...');
            setTimeout(() => (window.location.href = '/login'), 2000);
        } catch (err: any) {
            if (err.fieldErrors) {
                setErrors(err.fieldErrors);
                const visibility: Record<string, boolean> = {};
                Object.keys(err.fieldErrors).forEach((field) => {
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
                });
                setFieldErrorVisibility(visibility);
            } else {
                setError(err.message || 'Failed to reset password');
            }
        } finally {
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
        document.title = token ? 'Reset Password | Secure Note' : 'Forgot Password | Secure Note';
    }, [token]);

    useEffect(() => {
        if (error && !isExitingError) {
            const timer = setTimeout(() => {
                setIsExitingError(true);
                setTimeout(() => setError(''), 500);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, isExitingError]);

    useEffect(() => {
        if (message && !isExitingMessage) {
            const timer = setTimeout(() => {
                setIsExitingMessage(true);
                setTimeout(() => setMessage(''), 500);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, isExitingMessage]);

    return {
        token,
        email, setEmail,
        newPassword, setNewPassword,
        confirmPassword, setConfirmPassword,
        showPassword, setShowPassword,
        loading,
        errors, fieldErrorVisibility,
        error, message,
        isExitingError, isExitingMessage,
        handleRequestReset,
        handleResetPassword,
        dismissFieldError
    };
}