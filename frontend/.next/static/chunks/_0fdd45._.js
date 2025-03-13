(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/_0fdd45._.js", {

"[project]/src/services/api.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "api": (()=>api),
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const API_URL = ("TURBOPACK compile-time value", "http://localhost:5002");
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: `${API_URL}/api`,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});
const __TURBOPACK__default__export__ = api;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/services/auth.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "approveVerification": (()=>approveVerification),
    "getCurrentUser": (()=>getCurrentUser),
    "loginUser": (()=>loginUser),
    "registerUser": (()=>registerUser),
    "requestPasswordReset": (()=>requestPasswordReset),
    "requestVerification": (()=>requestVerification),
    "resetPassword": (()=>resetPassword),
    "verifyEmail": (()=>verifyEmail)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/services/api.ts [app-client] (ecmascript)");
;
const registerUser = async (username, email, password, confirmPassword)=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/register', {
            username,
            email,
            password,
            confirmPassword
        });
        return response.data;
    } catch (error) {
        if (error.response?.data?.errors) {
            const fieldErrors = {};
            error.response.data.errors.forEach((err)=>{
                fieldErrors[err.path || err.param] = err.msg;
            });
            throw {
                fieldErrors
            };
        }
        throw new Error(error.response?.data?.error || 'Registration failed');
    }
};
const loginUser = async (identifier, password)=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/login', {
            identifier,
            password
        });
        return response.data;
    } catch (error) {
        if (error.response?.data?.errors) {
            const fieldErrors = {};
            error.response.data.errors.forEach((err)=>{
                fieldErrors[err.path || err.param] = err.msg;
            });
            throw {
                fieldErrors
            };
        }
        throw new Error(error.response?.data?.error || 'Login failed');
    }
};
const requestPasswordReset = async (email)=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/request-reset', {
            email
        });
        return response.data;
    } catch (error) {
        if (error.response?.data?.errors) {
            const fieldErrors = {};
            error.response.data.errors.forEach((err)=>{
                fieldErrors[err.path || err.param] = err.msg;
            });
            throw {
                fieldErrors
            };
        }
        throw new Error(error.response?.data?.error || 'Failed to request password reset');
    }
};
const resetPassword = async (token, newPassword)=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/reset-password', {
            token,
            newPassword
        });
        return response.data;
    } catch (error) {
        if (error.response?.data?.errors) {
            const fieldErrors = {};
            error.response.data.errors.forEach((err)=>{
                fieldErrors[err.path || err.param] = err.msg;
            });
            throw {
                fieldErrors
            };
        }
        throw new Error(error.response?.data?.error || 'Failed to reset password');
    }
};
const verifyEmail = async (token)=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/auth/verify-email?token=${token}`);
        return response.data; // Typed as VerifyEmailResponse
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Email verification failed');
    }
};
const getCurrentUser = async (token)=>{
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/users/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch user');
    }
};
const requestVerification = async ()=>{
    try {
        const token = localStorage.getItem('token');
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/request-verification', {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to request verification');
    }
};
const approveVerification = async (userId)=>{
    try {
        const token = localStorage.getItem('token');
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/approve-verification', {
            userId
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to approve verification');
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/forgot-password/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>ForgotPasswordPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/services/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LockClosedIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockClosedIcon$3e$__ = __turbopack_import__("[project]/node_modules/@heroicons/react/24/outline/esm/LockClosedIcon.js [app-client] (ecmascript) <export default as LockClosedIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$EyeIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeIcon$3e$__ = __turbopack_import__("[project]/node_modules/@heroicons/react/24/outline/esm/EyeIcon.js [app-client] (ecmascript) <export default as EyeIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$EyeSlashIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeSlashIcon$3e$__ = __turbopack_import__("[project]/node_modules/@heroicons/react/24/outline/esm/EyeSlashIcon.js [app-client] (ecmascript) <export default as EyeSlashIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$XMarkIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XMarkIcon$3e$__ = __turbopack_import__("[project]/node_modules/@heroicons/react/24/outline/esm/XMarkIcon.js [app-client] (ecmascript) <export default as XMarkIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$EnvelopeIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EnvelopeIcon$3e$__ = __turbopack_import__("[project]/node_modules/@heroicons/react/24/outline/esm/EnvelopeIcon.js [app-client] (ecmascript) <export default as EnvelopeIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$XCircleIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircleIcon$3e$__ = __turbopack_import__("[project]/node_modules/@heroicons/react/24/outline/esm/XCircleIcon.js [app-client] (ecmascript) <export default as XCircleIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CheckCircleIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircleIcon$3e$__ = __turbopack_import__("[project]/node_modules/@heroicons/react/24/outline/esm/CheckCircleIcon.js [app-client] (ecmascript) <export default as CheckCircleIcon>");
;
var _s = __turbopack_refresh__.signature();
'use client';
;
;
;
;
;
function ForgotPasswordPage() {
    _s();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const token = searchParams.get('token');
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [newPassword, setNewPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showPassword, setShowPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [fieldErrorVisibility, setFieldErrorVisibility] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isExitingError, setIsExitingError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isExitingMessage, setIsExitingMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Validation for request reset form
    const validateRequestForm = ()=>{
        const newErrors = {};
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const visibility = {};
            Object.keys(newErrors).forEach((field)=>{
                visibility[field] = true;
                setTimeout(()=>{
                    setFieldErrorVisibility((prev)=>({
                            ...prev,
                            [field]: false
                        }));
                    setTimeout(()=>{
                        setErrors((prev)=>{
                            const updatedErrors = {
                                ...prev
                            };
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
    // Validation for reset password form
    const validateResetForm = ()=>{
        const newErrors = {};
        if (!newPassword) newErrors.newPassword = 'Password is required';
        else if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const visibility = {};
            Object.keys(newErrors).forEach((field)=>{
                visibility[field] = true;
                setTimeout(()=>{
                    setFieldErrorVisibility((prev)=>({
                            ...prev,
                            [field]: false
                        }));
                    setTimeout(()=>{
                        setErrors((prev)=>{
                            const updatedErrors = {
                                ...prev
                            };
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
    const handleRequestReset = async (e)=>{
        e.preventDefault();
        if (!validateRequestForm()) return;
        setError('');
        setMessage('');
        setFieldErrorVisibility({});
        setLoading(true);
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requestPasswordReset"])(email);
            setMessage(data.message || 'Password reset email sent! Check your inbox.');
        } catch (err) {
            if (err.fieldErrors) {
                setErrors(err.fieldErrors);
                const visibility = {};
                Object.keys(err.fieldErrors).forEach((field)=>{
                    visibility[field] = true;
                    setTimeout(()=>{
                        setFieldErrorVisibility((prev)=>({
                                ...prev,
                                [field]: false
                            }));
                        setTimeout(()=>{
                            setErrors((prev)=>{
                                const newErrors = {
                                    ...prev
                                };
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
        } finally{
            setLoading(false);
        }
    };
    const handleResetPassword = async (e)=>{
        e.preventDefault();
        if (!validateResetForm() || !token) return;
        setError('');
        setMessage('');
        setFieldErrorVisibility({});
        setLoading(true);
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resetPassword"])(token, newPassword);
            setMessage(data.message || 'Password reset successful! Redirecting to login...');
            setTimeout(()=>window.location.href = '/login', 2000);
        } catch (err) {
            if (err.fieldErrors) {
                setErrors(err.fieldErrors);
                const visibility = {};
                Object.keys(err.fieldErrors).forEach((field)=>{
                    visibility[field] = true;
                    setTimeout(()=>{
                        setFieldErrorVisibility((prev)=>({
                                ...prev,
                                [field]: false
                            }));
                        setTimeout(()=>{
                            setErrors((prev)=>{
                                const newErrors = {
                                    ...prev
                                };
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
        } finally{
            setLoading(false);
        }
    };
    const dismissFieldError = (field)=>{
        setFieldErrorVisibility((prev)=>({
                ...prev,
                [field]: false
            }));
        setTimeout(()=>{
            setErrors((prev)=>{
                const newErrors = {
                    ...prev
                };
                delete newErrors[field];
                return newErrors;
            });
        }, 500);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ForgotPasswordPage.useEffect": ()=>{
            if (error && !isExitingError) {
                const timer = setTimeout({
                    "ForgotPasswordPage.useEffect.timer": ()=>{
                        setIsExitingError(true);
                        setTimeout({
                            "ForgotPasswordPage.useEffect.timer": ()=>setError('')
                        }["ForgotPasswordPage.useEffect.timer"], 500);
                    }
                }["ForgotPasswordPage.useEffect.timer"], 3000);
                return ({
                    "ForgotPasswordPage.useEffect": ()=>clearTimeout(timer)
                })["ForgotPasswordPage.useEffect"];
            }
        }
    }["ForgotPasswordPage.useEffect"], [
        error,
        isExitingError
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ForgotPasswordPage.useEffect": ()=>{
            if (message && !isExitingMessage) {
                const timer = setTimeout({
                    "ForgotPasswordPage.useEffect.timer": ()=>{
                        setIsExitingMessage(true);
                        setTimeout({
                            "ForgotPasswordPage.useEffect.timer": ()=>setMessage('')
                        }["ForgotPasswordPage.useEffect.timer"], 500);
                    }
                }["ForgotPasswordPage.useEffect.timer"], 3000);
                return ({
                    "ForgotPasswordPage.useEffect": ()=>clearTimeout(timer)
                })["ForgotPasswordPage.useEffect"];
            }
        }
    }["ForgotPasswordPage.useEffect"], [
        message,
        isExitingMessage
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center animate-fadeIn max-w-md w-full mx-4 my-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center justify-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LockClosedIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockClosedIcon$3e$__["LockClosedIcon"], {
                            className: "h-6 w-6 mr-2 text-gray-400"
                        }, void 0, false, {
                            fileName: "[project]/app/forgot-password/page.tsx",
                            lineNumber: 198,
                            columnNumber: 21
                        }, this),
                        token ? 'Reset Password' : 'Forgot Password'
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/forgot-password/page.tsx",
                    lineNumber: 197,
                    columnNumber: 17
                }, this),
                !token ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleRequestReset,
                    className: "space-y-4",
                    noValidate: true,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "email",
                                    className: "sr-only",
                                    children: "Email"
                                }, void 0, false, {
                                    fileName: "[project]/app/forgot-password/page.tsx",
                                    lineNumber: 206,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$EnvelopeIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EnvelopeIcon$3e$__["EnvelopeIcon"], {
                                            className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                                        }, void 0, false, {
                                            fileName: "[project]/app/forgot-password/page.tsx",
                                            lineNumber: 208,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "email",
                                            type: "email",
                                            value: email,
                                            onChange: (e)=>setEmail(e.target.value),
                                            placeholder: "Email",
                                            className: "w-full pl-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200",
                                            "aria-describedby": "email-error"
                                        }, void 0, false, {
                                            fileName: "[project]/app/forgot-password/page.tsx",
                                            lineNumber: 209,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/forgot-password/page.tsx",
                                    lineNumber: 207,
                                    columnNumber: 29
                                }, this),
                                errors.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    id: "email-error",
                                    className: `min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out flex items-center ${fieldErrorVisibility.email ? 'opacity-100 animate-fadeInShort' : 'opacity-0'}`,
                                    children: [
                                        errors.email,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>dismissFieldError('email'),
                                            className: "ml-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$XMarkIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XMarkIcon$3e$__["XMarkIcon"], {
                                                className: "h-4 w-4 text-red-500"
                                            }, void 0, false, {
                                                fileName: "[project]/app/forgot-password/page.tsx",
                                                lineNumber: 223,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/forgot-password/page.tsx",
                                            lineNumber: 222,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/forgot-password/page.tsx",
                                    lineNumber: 220,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/forgot-password/page.tsx",
                            lineNumber: 205,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: loading,
                            className: `w-full bg-slate-600 dark:bg-slate-500 text-white dark:text-gray-900 p-3 rounded-md hover:bg-slate-500 dark:hover:bg-slate-400 transition duration-200 flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`,
                            children: [
                                loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "animate-spin h-5 w-5 mr-2 text-white",
                                    xmlns: "http://www.w3.org/2000/svg",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                            className: "opacity-25",
                                            cx: "12",
                                            cy: "12",
                                            r: "10",
                                            stroke: "currentColor",
                                            strokeWidth: "4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/forgot-password/page.tsx",
                                            lineNumber: 236,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            className: "opacity-75",
                                            fill: "currentColor",
                                            d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        }, void 0, false, {
                                            fileName: "[project]/app/forgot-password/page.tsx",
                                            lineNumber: 237,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/forgot-password/page.tsx",
                                    lineNumber: 235,
                                    columnNumber: 33
                                }, this) : null,
                                "Send Reset Link"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/forgot-password/page.tsx",
                            lineNumber: 229,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/forgot-password/page.tsx",
                    lineNumber: 203,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleResetPassword,
                    className: "space-y-4",
                    noValidate: true,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "newPassword",
                                    className: "sr-only",
                                    children: "New Password"
                                }, void 0, false, {
                                    fileName: "[project]/app/forgot-password/page.tsx",
                                    lineNumber: 247,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LockClosedIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockClosedIcon$3e$__["LockClosedIcon"], {
                                            className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                                        }, void 0, false, {
                                            fileName: "[project]/app/forgot-password/page.tsx",
                                            lineNumber: 249,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "newPassword",
                                            type: showPassword ? 'text' : 'password',
                                            value: newPassword,
                                            onChange: (e)=>setNewPassword(e.target.value),
                                            placeholder: "New Password",
                                            className: "w-full pl-10 pr-10 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-slate-500 transition duration-200",
                                            "aria-describedby": "newPassword-error"
                                        }, void 0, false, {
                                            fileName: "[project]/app/forgot-password/page.tsx",
                                            lineNumber: 250,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setShowPassword(!showPassword),
                                            className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                                            children: showPassword ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$EyeSlashIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeSlashIcon$3e$__["EyeSlashIcon"], {
                                                className: "h-5 w-5"
                                            }, void 0, false, {
                                                fileName: "[project]/app/forgot-password/page.tsx",
                                                lineNumber: 264,
                                                columnNumber: 53
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$EyeIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeIcon$3e$__["EyeIcon"], {
                                                className: "h-5 w-5"
                                            }, void 0, false, {
                                                fileName: "[project]/app/forgot-password/page.tsx",
                                                lineNumber: 264,
                                                columnNumber: 92
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/forgot-password/page.tsx",
                                            lineNumber: 259,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/forgot-password/page.tsx",
                                    lineNumber: 248,
                                    columnNumber: 29
                                }, this),
                                errors.newPassword && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    id: "newPassword-error",
                                    className: `min-h-[18px] text-sm text-red-500 transition-opacity duration-300 ease-in-out flex items-center ${fieldErrorVisibility.newPassword ? 'opacity-100 animate-fadeInShort' : 'opacity-0'}`,
                                    children: [
                                        errors.newPassword,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>dismissFieldError('newPassword'),
                                            className: "ml-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$XMarkIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XMarkIcon$3e$__["XMarkIcon"], {
                                                className: "h-4 w-4 text-red-500"
                                            }, void 0, false, {
                                                fileName: "[project]/app/forgot-password/page.tsx",
                                                lineNumber: 271,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/forgot-password/page.tsx",
                                            lineNumber: 270,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/forgot-password/page.tsx",
                                    lineNumber: 268,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/forgot-password/page.tsx",
                            lineNumber: 246,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: loading,
                            className: `w-full bg-slate-600 dark:bg-slate-500 text-white dark:text-gray-900 p-3 rounded-md hover:bg-slate-500 dark:hover:bg-slate-400 transition duration-200 flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`,
                            children: [
                                loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "animate-spin h-5 w-5 mr-2 text-white",
                                    xmlns: "http://www.w3.org/2000/svg",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                            className: "opacity-25",
                                            cx: "12",
                                            cy: "12",
                                            r: "10",
                                            stroke: "currentColor",
                                            strokeWidth: "4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/forgot-password/page.tsx",
                                            lineNumber: 284,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            className: "opacity-75",
                                            fill: "currentColor",
                                            d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        }, void 0, false, {
                                            fileName: "[project]/app/forgot-password/page.tsx",
                                            lineNumber: 285,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/forgot-password/page.tsx",
                                    lineNumber: 283,
                                    columnNumber: 33
                                }, this) : null,
                                "Reset Password"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/forgot-password/page.tsx",
                            lineNumber: 277,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/forgot-password/page.tsx",
                    lineNumber: 244,
                    columnNumber: 21
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: `bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm p-2 rounded-md animate-fadeInShort flex items-center transition-opacity duration-500 ${isExitingError ? 'opacity-0' : 'opacity-100'}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$XCircleIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircleIcon$3e$__["XCircleIcon"], {
                            className: "h-5 w-5 mr-2 text-red-800 dark:text-red-200"
                        }, void 0, false, {
                            fileName: "[project]/app/forgot-password/page.tsx",
                            lineNumber: 295,
                            columnNumber: 25
                        }, this),
                        error,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setError(''),
                            className: "ml-auto",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$XMarkIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XMarkIcon$3e$__["XMarkIcon"], {
                                className: "h-5 w-5 text-red-800 dark:text-red-200"
                            }, void 0, false, {
                                fileName: "[project]/app/forgot-password/page.tsx",
                                lineNumber: 298,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/forgot-password/page.tsx",
                            lineNumber: 297,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/forgot-password/page.tsx",
                    lineNumber: 294,
                    columnNumber: 21
                }, this),
                message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: `bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm p-2 rounded-md animate-fadeInShort flex items-center transition-opacity duration-500 ${isExitingMessage ? 'opacity-0' : 'opacity-100'}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CheckCircleIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircleIcon$3e$__["CheckCircleIcon"], {
                            className: "h-5 w-5 mr-2 text-green-800 dark:text-green-200"
                        }, void 0, false, {
                            fileName: "[project]/app/forgot-password/page.tsx",
                            lineNumber: 304,
                            columnNumber: 25
                        }, this),
                        message,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setMessage(''),
                            className: "ml-auto",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$XMarkIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XMarkIcon$3e$__["XMarkIcon"], {
                                className: "h-5 w-5 text-green-800 dark:text-green-200"
                            }, void 0, false, {
                                fileName: "[project]/app/forgot-password/page.tsx",
                                lineNumber: 307,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/forgot-password/page.tsx",
                            lineNumber: 306,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/forgot-password/page.tsx",
                    lineNumber: 303,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-4 text-sm text-gray-900 dark:text-gray-100",
                    children: [
                        "Back to",
                        ' ',
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/login",
                            className: "text-slate-600 dark:text-slate-500 hover:text-slate-400 dark:hover:text-slate-300 hover:underline transition duration-200",
                            children: "Login"
                        }, void 0, false, {
                            fileName: "[project]/app/forgot-password/page.tsx",
                            lineNumber: 314,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/forgot-password/page.tsx",
                    lineNumber: 312,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/forgot-password/page.tsx",
            lineNumber: 196,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/forgot-password/page.tsx",
        lineNumber: 195,
        columnNumber: 9
    }, this);
}
_s(ForgotPasswordPage, "IGrINNnmj+tsaWhxT5Jp6tBBOxo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = ForgotPasswordPage;
var _c;
__turbopack_refresh__.register(_c, "ForgotPasswordPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/forgot-password/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),
}]);

//# sourceMappingURL=_0fdd45._.js.map