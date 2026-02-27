import { Form, Input, Checkbox, Button, notification } from 'antd';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import FullLogolight from '../assets/FullLogolight.png';
import MobileVersionlight from '../assets/MobileVersionlight.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore.js';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore.js';


const LoginPage = () => {
    const [form] = Form.useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { darkMode } = useThemeStore();
    const { login , signWithGoogle} = useAuthStore();

    const onFinish = async (values) => {
        try{
            setLoading(true);
            await login({
                email: values.email,
                password: values.password
            });
            navigate('/dashboard');
        }catch(err){
            console.error('Login failed:', err);
            notification.error({
                message: 'Login Failed',
                description: err.response?.data?.message || 'An error occurred during login. Please try again.',
            });
        }finally{
            setLoading(false);
        }
    };

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



    const handleSignInWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                await signWithGoogle(tokenResponse.access_token);
                navigate('/dashboard');
            } catch (err) {
                notification.error({
                    message: 'Google Sign-In Failed',
                    description: err.response?.data?.message || 'An error occurred during Google sign-in. Please try again.',
                });
            }
        },
        onError: () => {
             notification.error({
                    message: 'Google Sign-In Failed',
                    description: "Google sign-in was unsuccessful. Please try again.",
            });
        },
    });

    return (
        <div className="w-full h-screen flex items-center justify-center bg-bg overflow-hidden relative">
            {/* Background decorative blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-130 h-130 rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute -bottom-40 left-1/4 w-100 h-100 rounded-full bg-ai/10 blur-[100px]" />
                <div className="absolute top-1/3 -right-24 w-90 h-90 rounded-full bg-accent/10 blur-[100px]" />
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
                        Welcome Back!
                    </h1>
                    <p className="text-lg text-text-secondary leading-relaxed border-l-4 border-primary pl-6">
                        Welcome to our AI-powered platform! Please log in to access your
                        personalized dashboard and explore the cutting-edge features we have
                        to offer. Your journey to enhanced productivity and innovation starts
                        here!
                    </p>

                    {/* Feature Highlights */}
                    <div className="mt-12 space-y-4">
                        {[
                            {
                                icon: <Sparkles className="w-4 h-4 text-ai" />,
                                bg: 'bg-ai/10',
                                label: 'AI-powered insights and recommendations',
                            },
                            {
                                icon: <div className="w-2 h-2 rounded-full bg-accent" />,
                                bg: 'bg-accent/10',
                                label: 'Real-time data visualization',
                            },
                            {
                                icon: <div className="w-2 h-2 rounded-full bg-success" />,
                                bg: 'bg-success/10',
                                label: 'Secure and encrypted connection',
                            },
                        ].map(({ icon, bg, label }, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-3 rounded-xl bg-surface/60 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-colors duration-200"
                            >
                                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                                    {icon}
                                </div>
                                <span className="text-text-secondary text-sm font-medium">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Decorative stats strip */}
                    <div className="mt-12 flex items-center gap-8">
                        {[
                            { value: '99.9%', label: 'Uptime' },
                            { value: '256-bit', label: 'Encryption' },
                            { value: '24/7', label: 'Support' },
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

            {/* Right Section - Login Form */}
            <div className="flex-1 h-full flex flex-col items-center justify-center p-12 relative">

                {/* Corner accent */}
                <div className="pointer-events-none absolute top-8 right-8 w-24 h-24 border-t-2 border-r-2 border-primary/20 rounded-tr-2xl" />
                <div className="pointer-events-none absolute bottom-8 left-8 w-24 h-24 border-b-2 border-l-2 border-primary/20 rounded-bl-2xl" />

                <div className="lg:hidden">
                    <MobileLogo />
                </div>

                <div className="w-full max-w-md relative z-10">
                    {/* Form Container */}
                    <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-border relative overflow-hidden">

                        {/* Inner top-right glow */}
                        <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/10 blur-[60px]" />

                        <h2 className="text-3xl font-bold text-text mb-1 relative z-10">Sign In</h2>
                        <p className="text-text-secondary mb-8 relative z-10">
                            Don't have an account?{' '}
                            <Button
                                type="link"
                                className="p-0! h-auto! text-primary hover:text-primary-hover font-medium"
                                onClick={() => navigate('/register')}
                            >
                                Create one now
                            </Button>
                        </p>

                        <Form
                            form={form}
                            name="login"
                            onFinish={onFinish}
                            layout="vertical"
                            requiredMark={false}
                            size="large"
                            className="relative z-10"
                        >
                            {/* Email Field */}
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Please enter your email' },
                                    { type: 'email', message: 'Please enter a valid email' }
                                ]}
                                className="mb-5!"
                            >
                                <Input
                                    prefix={<Mail className="w-5 h-5 text-text-muted" />}
                                    placeholder="Email Address"
                                    className="bg-surface-alt! border-border! text-text! hover:border-primary! focus:border-primary! focus:shadow-none!"
                                />
                            </Form.Item>

                            {/* Password Field */}
                            <Form.Item
                                name="password"
                                rules={[
                                    { required: true, message: 'Please enter your password' },
                                    { min: 6, message: 'Password must be at least 6 characters' }
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
                                    placeholder="Password"
                                    className="bg-surface-alt! border-border! text-text! hover:border-primary! focus:border-primary! focus:shadow-none!"
                                />
                            </Form.Item>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between mb-6">
                                <Form.Item name="remember" valuePropName="checked" className="mb-0!">
                                    <Checkbox className="text-text-secondary">
                                        <span className="text-text-secondary">Remember me</span>
                                    </Checkbox>
                                </Form.Item>

                                <Button
                                    type="link"
                                    className="p-0! h-auto! text-primary hover:text-primary-hover"
                                    onClick={() => navigate('/forgot')}

                                >
                                    Forgot password?
                                </Button>
                            </div>

                            {/* Submit Button */}
                            <Form.Item className="mb-4!">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    className="bg-primary! border-primary! hover:bg-primary-hover! hover:border-primary-hover! h-12! text-base! font-semibold!"
                                >
                                    Sign In
                                </Button>
                            </Form.Item>

                            {/* Google Sign In Button */}
                            <Form.Item className="mb-0!">
                                <Button
                                    type="default"
                                    block
                                    size="large"
                                    onClick={handleSignInWithGoogle}
                                    className="flex items-center justify-center gap-2 border-border! rounded-lg! hover:bg-surface-alt! transition-all"
                                    icon={
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    }
                                >
                                    Sign in with Google
                                </Button>
                            </Form.Item>

                            {/* Demo Credentials */}
                            <div className="mt-6 p-4 bg-surface-alt rounded-xl border border-border/70">
                                <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
                                    Demo Credentials
                                </p>
                                <div className="space-y-2 text-xs text-text-muted">
                                    <div className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2 border border-border/50">
                                        <Mail className="w-3.5 h-3.5 text-primary/60" />
                                        <span className="font-mono">tabaiiyadh317@gmail.com</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2 border border-border/50">
                                        <Lock className="w-3.5 h-3.5 text-primary/60" />
                                        <span className="font-mono">Iyadh@123</span>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;