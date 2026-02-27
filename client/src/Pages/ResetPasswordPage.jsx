import { Form, Input, Button } from 'antd';
import { Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import FullLogolight from '../assets/FullLogolight.png';
import MobileVersionlight from '../assets/MobileVersionlight.png';
import { useState } from 'react';
import { useThemeStore } from '../store/themeStore.js';
import { useParams } from 'react-router-dom';
import  api  from '../lib/api.js';

const ResetPasswordPage = () => {
    const [form] = Form.useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetComplete, setResetComplete] = useState(false);
    const [tokenValid, setTokenValid] = useState(true); // Assume token is valid for demo
    const { darkMode } = useThemeStore();
    const { token } = useParams();

    const onFinish = async (values) => {
        setLoading(true);
        try{
            await api.post(`/password/reset/${token}`, { password: values.password });
            
        }catch(err){
            console.log(err);
        }finally{
            setLoading(false);
            setResetComplete(true);
        }
    };

    // Password strength checker
    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: 'No password', color: 'text-text-muted' };
        
        let score = 0;
        if (password.length >= 8) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^A-Za-z0-9]/)) score++;
        
        const strengths = [
            { label: 'Weak', color: 'text-error' },
            { label: 'Fair', color: 'text-warning' },
            { label: 'Good', color: 'text-info' },
            { label: 'Strong', color: 'text-success' }
        ];
        
        return { score, ...strengths[score - 1] || { label: 'Very Weak', color: 'text-error' } };
    };

    const password = Form.useWatch('password', form);
    const strength = getPasswordStrength(password);



    const Logo = () => {
        if (darkMode) {
            return <img src={FullLogolight} alt="Logo"
                style={
                    { filter: 'invert(1) brightness(1.1)' }
                } />
        }
        return <img src={FullLogolight} alt="Logo" />
    }

    const MobileLogo = () => {
        if (darkMode) {
            return <img src={MobileVersionlight} alt="Logo" className='w-50 h-50'
                style={
                    { filter: 'invert(1) brightness(1.1)' }
                } />
        }
        return <img src={MobileVersionlight} alt="Logo" className='w-50 h-50' />
    }

    return (
        <div className="w-full h-screen flex items-center justify-center bg-bg overflow-hidden relative">

            {/* Background decorative blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -right-32 w-130 h-130 rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute -bottom-40 left-1/4 w-100 h-100 rounded-full bg-success/10 blur-[100px]" />
                <div className="absolute top-1/3 -left-24 w-90 h-90 rounded-full bg-ai/10 blur-[100px]" />
            </div>

            {/* Subtle dot-grid background pattern */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            {/* Left Section - Branding */}
            <div className="hidden lg:flex lg:w-1/2 flex-1 h-full flex-col items-center justify-center p-12 relative">

                {/* Large decorative ring behind content */}
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-130 h-130 rounded-full border border-primary/10" />
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-170 h-170 rounded-full border border-primary/5" />

                <div className="max-w-xl relative z-10">
                    <Logo />

                    <h1 className="text-5xl font-bold text-text mb-5 leading-tight tracking-tight">
                        Create New Password
                    </h1>
                    <p className="text-lg text-text-secondary leading-relaxed border-l-4 border-success pl-6">
                        Your security is our priority. Create a strong, unique password 
                        that you haven't used elsewhere to protect your account.
                    </p>

                    {/* Password Tips */}
                    <div className="mt-12 space-y-4">
                        {[
                            {
                                icon: <CheckCircle className="w-4 h-4 text-success" />,
                                bg: 'bg-success/10',
                                label: 'At least 8 characters long',
                            },
                            {
                                icon: <CheckCircle className="w-4 h-4 text-success" />,
                                bg: 'bg-success/10',
                                label: 'Mix of letters, numbers & symbols',
                            },
                            {
                                icon: <Shield className="w-4 h-4 text-ai" />,
                                bg: 'bg-ai/10',
                                label: 'Don\'t reuse old passwords',
                            },
                        ].map(({ icon, bg, label }, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-3 rounded-xl bg-surface/60 border border-border/50 backdrop-blur-sm hover:border-success/30 transition-colors duration-200"
                            >
                                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                                    {icon}
                                </div>
                                <span className="text-text-secondary text-sm font-medium">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Security Stats */}
                    <div className="mt-12 flex items-center gap-8">
                        {[
                            { value: '256-bit', label: 'Encryption' },
                            { value: '2FA', label: 'Available' },
                            { value: '24/7', label: 'Monitoring' },
                        ].map(({ value, label }) => (
                            <div key={label} className="text-center">
                                <p className="text-xl font-bold text-text">{value}</p>
                                <p className="text-xs text-text-muted mt-0.5">{label}</p>
                            </div>
                        ))}
                        <div className="flex-1 h-px bg-border ml-2" />
                    </div>
                </div>
            </div>

            {/* Vertical divider */}
            <div className="h-2/3 w-px bg-linear-to-b from-transparent via-border to-transparent shrink-0" />

            {/* Right Section - Reset Password Form */}
            <div className="flex-1 h-full flex flex-col items-center justify-center p-12 relative">

                {/* Corner accent */}
                <div className="pointer-events-none absolute top-8 right-8 w-24 h-24 border-t-2 border-r-2 border-success/20 rounded-tr-2xl" />
                <div className="pointer-events-none absolute bottom-8 left-8 w-24 h-24 border-b-2 border-l-2 border-success/20 rounded-bl-2xl" />


                <div className="lg:hidden">
                    <MobileLogo />
                </div>

                <div className="w-full max-w-md relative z-10">
                    {/* Form Container */}
                    <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-border relative overflow-hidden">

                        {/* Inner top-right glow */}
                        <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-success/10 blur-[60px]" />

                        {tokenValid ? (
                            !resetComplete ? (
                                <>
                                    <h2 className="text-3xl font-bold text-text mb-1 relative z-10">Set New Password</h2>
                                    <p className="text-text-secondary mb-6 relative z-10">
                                        Create a new password for your account
                                    </p>

                                    <Form
                                        form={form}
                                        name="resetPassword"
                                        onFinish={onFinish}
                                        layout="vertical"
                                        requiredMark={false}
                                        size="large"
                                        className="relative z-10"
                                    >
                                        {/* New Password Field */}
                                        <Form.Item
                                            name="password"
                                            rules={[
                                                { required: true, message: 'Please enter your new password' },
                                                { min: 8, message: 'Password must be at least 8 characters' },
                                                {
                                                    pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/,
                                                    message: 'Must contain letter, number & special character'
                                                }
                                            ]}
                                            className="mb-4!"
                                        >
                                            <Input
                                                prefix={<Lock className="w-5 h-5 text-text-muted" />}
                                                suffix={
                                                    <Button
                                                        type="text"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="p-0! h-auto! border-none! shadow-none!"
                                                        icon={
                                                            showPassword ?
                                                                <EyeOff className="w-5 h-5 text-text-muted" /> :
                                                                <Eye className="w-5 h-5 text-text-muted" />
                                                        }
                                                    />
                                                }
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="New Password"
                                                className="bg-surface-alt! border-border! text-text! hover:border-success! focus:border-success! focus:shadow-none!"
                                            />
                                        </Form.Item>

                                        {/* Password Strength Indicator */}
                                        {password && (
                                            <div className="mb-5 -mt-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="flex-1 h-1.5 bg-surface-alt rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-300 ${
                                                                strength.score === 1 ? 'w-1/4 bg-error' :
                                                                strength.score === 2 ? 'w-2/4 bg-warning' :
                                                                strength.score === 3 ? 'w-3/4 bg-info' :
                                                                strength.score === 4 ? 'w-full bg-success' : 'w-0'
                                                            }`}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-medium ${strength.color}`}>
                                                        {strength.label}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Confirm Password Field */}
                                        <Form.Item
                                            name="confirmPassword"
                                            dependencies={['password']}
                                            rules={[
                                                { required: true, message: 'Please confirm your password' },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (!value || getFieldValue('password') === value) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject(new Error('Passwords do not match'));
                                                    },
                                                }),
                                            ]}
                                            className="mb-6!"
                                        >
                                            <Input
                                                prefix={<Lock className="w-5 h-5 text-text-muted" />}
                                                suffix={
                                                    <Button
                                                        type="text"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="p-0! h-auto! border-none! shadow-none!"
                                                        icon={
                                                            showConfirmPassword ?
                                                                <EyeOff className="w-5 h-5 text-text-muted" /> :
                                                                <Eye className="w-5 h-5 text-text-muted" />
                                                        }
                                                    />
                                                }
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Confirm New Password"
                                                className="bg-surface-alt! border-border! text-text! hover:border-success! focus:border-success! focus:shadow-none!"
                                            />
                                        </Form.Item>

                                        {/* Submit Button */}
                                        <Form.Item className="mb-4!">
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={loading}
                                                block
                                                className="bg-success! border-success! hover:bg-green-600! hover:border-green-600! h-12! text-base! font-semibold!"
                                            >
                                                Reset Password
                                            </Button>
                                        </Form.Item>

                                        {/* Security Note */}
                                        <div className="text-center">
                                            <p className="text-xs text-text-muted">
                                                <Shield className="w-3 h-3 inline mr-1" />
                                                This link will expire in 24 hours for your security
                                            </p>
                                        </div>
                                    </Form>
                                </>
                            ) : (
                                // Success State
                                <div className="relative z-10 text-center py-8">
                                    <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-10 h-10 text-success" />
                                    </div>
                                    
                                    <h2 className="text-2xl font-bold text-text mb-3">Password Reset Complete!</h2>
                                    <p className="text-text-secondary mb-8">
                                        Your password has been successfully updated.
                                    </p>
                                    
                                    <Button
                                        type="primary"
                                        href="/login"
                                        block
                                        className="bg-success! border-success! hover:bg-green-600! hover:border-green-600! h-12! text-base! font-semibold! mb-3"
                                    >
                                        Continue to Login
                                    </Button>
                                    
                                    <Button
                                        type="link"
                                        href="/"
                                        className="text-text-secondary hover:text-success! p-0! h-auto!"
                                    >
                                        Return to Home
                                    </Button>
                                </div>
                            )
                        ) : (
                            // Invalid Token State
                            <div className="relative z-10 text-center py-8">
                                <div className="w-20 h-20 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-10 h-10 text-error" />
                                </div>
                                
                                <h2 className="text-2xl font-bold text-text mb-3">Invalid Reset Link</h2>
                                <p className="text-text-secondary mb-6">
                                    This password reset link has expired or is invalid.
                                </p>
                                
                                <Button
                                    type="primary"
                                    href="/forgot-password"
                                    block
                                    className="bg-primary! border-primary! hover:bg-primary-hover! hover:border-primary-hover! h-12! text-base! font-semibold! mb-3"
                                >
                                    Request New Link
                                </Button>
                                
                                <Button
                                    type="link"
                                    href="/login"
                                    className="text-text-secondary hover:text-primary! p-0! h-auto!"
                                >
                                    Back to Login
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;