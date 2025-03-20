'use client';
import { useEffect, useState } from 'react';
import { registerUser } from '@/services/auth';

export function useRegisterLogic() {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fieldErrorVisibility, setFieldErrorVisibility] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isExitingError, setIsExitingError] = useState(false);
    const [isExitingMessage, setIsExitingMessage] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!username) newErrors.username = 'Username is required';
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (!confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
        else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

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

    const getPasswordStrength = () => {
        if (!password) return '';
        if (password.length < 6) return 'Weak';
        if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) return 'Strong';
        return 'Medium';
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setError('');
        setFieldErrorVisibility({});
        setMessage('');
        setIsExitingError(false);
        setIsExitingMessage(false);
        setLoading(true);

        try {
            const data = await registerUser(username, email, password, confirmPassword);
            setMessage(data.message || 'Registration successful!');
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
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
                setError(err.message || 'Registration failed');
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
        document.title = 'Register | Secure Note';
    }, []);

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
        username, setUsername,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        showPassword, setShowPassword,
        loading,
        errors, fieldErrorVisibility,
        error, message,
        isExitingError, isExitingMessage,
        getPasswordStrength,
        handleRegister,
        dismissFieldError
    };
}