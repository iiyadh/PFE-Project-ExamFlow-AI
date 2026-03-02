import { Form, Input, Checkbox, Button , notification } from 'antd';
import { 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    User, 
    Sparkles,
    Shield,
    Rocket,
    Calendar
} from 'lucide-react';
import FullLogolight from '../assets/FullLogolight.png';
import MobileVersionlight from '../assets/MobileVersionlight.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore.js';
import { useAuthStore } from '../store/authStore.js';

const RegisterPage = () => {
    const [form] = Form.useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { darkMode } = useThemeStore();
    const { register } = useAuthStore();

    const onFinish = async (values) => {
        try{
            setLoading(true);
            await register({
                username: values.fullName,
                email: values.email,
                password: values.password
            });
            navigate('/dashboard');
        }catch(err){
            console.error('Registration failed:', err);
            notification.error({
                message: 'Registration Failed',
                description: err.response?.data?.message || 'An error occurred during registration. Please try again.',
                placement: 'topRight',
            });
        }finally{
            setLoading(false);
        }
    };


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


    const Logo = () =>{
        if (darkMode) {
            return <img src={FullLogolight} alt="Logo"
            style={
            { filter: 'invert(1) brightness(1.1)'}
            }/>
        }
        return <img src={FullLogolight} alt="Logo" />
    }

    const MobileLogo = () =>{
        if (darkMode) {
            return <img src={MobileVersionlight} alt="Logo" className='w-50 h-50'
            style={
            { filter: 'invert(1) brightness(1.1)'}
            }/>
        }
        return <img src={MobileVersionlight} alt="Logo" className='w-50 h-50' />
    }

    return (
        <div className="w-full h-screen flex items-center justify-center bg-bg overflow-hidden relative">

            {/* Background decorative blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -right-32 w-130 h-130 rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute -bottom-40 right-1/4 w-100 h-100 rounded-full bg-ai/10 blur-[100px]" />
                <div className="absolute top-1/3 -left-24 w-90 h-90 rounded-full bg-accent/10 blur-[100px]" />
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
            <div className="hidden lg:flex lg:w-1/2 flex-1 h-full flex-col items-center justify-center relative">

                {/* Large decorative ring behind content */}
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-130 h-130 rounded-full border border-primary/10" />
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-170 h-170 rounded-full border border-primary/5" />

                <div className="max-w-xl relative z-10">
                    <Logo className="mb-8" />

                    <h1 className="text-5xl font-bold text-text mb-5 leading-tight tracking-tight">
                        Join Our Platform
                    </h1>
                    <p className="text-lg text-text-secondary leading-relaxed border-l-4 border-ai pl-6">
                        Start your journey with our AI-powered platform today! Create an account 
                        to unlock personalized insights, advanced analytics, and cutting-edge 
                        features designed to boost your productivity.
                    </p>

                    {/* Feature Highlights with different icons */}
                    <div className="mt-12 space-y-4">
                        {[
                            {
                                icon: <Rocket className="w-4 h-4 text-accent" />,
                                bg: 'bg-accent/10',
                                label: 'Get started in minutes',
                            },
                            {
                                icon: <Shield className="w-4 h-4 text-success" />,
                                bg: 'bg-success/10',
                                label: 'Enterprise-grade security',
                            },
                            {
                                icon: <Sparkles className="w-4 h-4 text-ai" />,
                                bg: 'bg-ai/10',
                                label: 'Free AI-powered insights',
                            },
                        ].map(({ icon, bg, label }, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-3 rounded-xl bg-surface/60 border border-border/50 backdrop-blur-sm hover:border-ai/30 transition-colors duration-200"
                            >
                                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                                    {icon}
                                </div>
                                <span className="text-text-secondary text-sm font-medium">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats strip */}
                    <div className="mt-12 flex items-center gap-8">
                        {[
                            { value: '10K+', label: 'Active Users' },
                            { value: '50M+', label: 'Data Points' },
                            { value: '99.9%', label: 'Satisfaction' },
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

            {/* Right Section - Registration Form */}
            <div className="flex-1 h-full flex flex-col items-center justify-center relative overflow-y-auto">

                {/* Corner accent */}
                <div className="pointer-events-none absolute top-8 right-8 w-24 h-24 border-t-2 border-r-2 border-ai/20 rounded-tr-2xl" />
                <div className="pointer-events-none absolute bottom-8 left-8 w-24 h-24 border-b-2 border-l-2 border-ai/20 rounded-bl-2xl" />

                <div className="lg:hidden">
                    <MobileLogo />
                </div>

                <div className="w-full max-w-md relative z-10 py-8">
                    {/* Form Container */}
                    <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-border relative overflow-hidden">

                        {/* Inner top-right glow */}
                        <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-ai/10 blur-[60px]" />

                        <h2 className="text-3xl font-bold text-text mb-1 relative z-10">Create Account</h2>
                        <p className="text-text-secondary mb-8 relative z-10">
                            Already have an account?{' '}
                            <Button
                                type="link"
                                className="p-0! h-auto! text-ai hover:text-primary-hover font-medium"
                                onClick={() => navigate('/login')}
                            >
                                Sign in instead
                            </Button>
                        </p>

                        <Form
                            form={form}
                            name="register"
                            onFinish={onFinish}
                            layout="vertical"
                            requiredMark={false}
                            size="large"
                            className="relative z-10"
                        >
                            {/* Full Name Field */}
                            <Form.Item
                                name="fullName"
                                rules={[
                                    { required: true, message: 'Please enter your full name' },
                                    { min: 2, message: 'Name must be at least 2 characters' }
                                ]}
                                className="mb-5!"
                            >
                                <Input
                                    prefix={<User className="w-5 h-5 text-text-muted" />}
                                    placeholder="Full Name"
                                    className="bg-surface-alt! border-border! text-text! hover:border-ai! focus:border-ai! focus:shadow-none!"
                                />
                            </Form.Item>

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
                                    className="bg-surface-alt! border-border! text-text! hover:border-ai! focus:border-ai! focus:shadow-none!"
                                />
                            </Form.Item>

                            {/* Password Field */}
                            <Form.Item
                                name="password"
                                rules={[
                                    { required: true, message: 'Please enter your password' },
                                    { min: 8, message: 'Password must be at least 8 characters' },
                                    {
                                        pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/,
                                        message: 'Password must contain at least one letter, one number, and one special character'
                                    }
                                ]}
                                className="mb-5!"
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
                                    className="bg-surface-alt! border-border! text-text! hover:border-ai! focus:border-ai! focus:shadow-none!"
                                />
                            </Form.Item>

                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="mb-5 -mt-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 h-1.5 bg-surface-alt rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${strength.score === 1 ? 'w-1/4 bg-error' :
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
                                className="mb-5!"
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
                                    placeholder="Confirm Password"
                                    className="bg-surface-alt! border-border! text-text! hover:border-ai! focus:border-ai! focus:shadow-none!"
                                />
                            </Form.Item>

                            {/* Terms & Conditions */}
                            <Form.Item
                                name="agreement"
                                valuePropName="checked"
                                rules={[
                                    {
                                        validator: (_, value) =>
                                            value ? Promise.resolve() : Promise.reject(new Error('Please accept the terms and conditions')),
                                    },
                                ]}
                                className="mb-6!"
                            >
                                <Checkbox className="text-text-secondary">
                                    <span className="text-text-secondary">
                                        I agree to the{' '}
                                        <Button type="link" className="p-0! h-auto! text-ai hover:text-primary-hover">
                                            Terms of Service
                                        </Button>{' '}
                                        and{' '}
                                        <Button type="link" className="p-0! h-auto! text-ai hover:text-primary-hover">
                                            Privacy Policy
                                        </Button>
                                    </span>
                                </Checkbox>
                            </Form.Item>

                            {/* Submit Button */}
                            <Form.Item className="mb-4!">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    className="bg-ai! border-ai! hover:bg-primary-hover! hover:border-primary-hover! h-12! text-base! font-semibold!"
                                >
                                    Create Account
                                </Button>
                            </Form.Item>

                            {/* Benefits Card */}
                            <div className="mt-6 p-4 bg-linear-to-br from-ai/5 to-accent/5 rounded-xl border border-ai/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <Rocket className="w-4 h-4 text-ai" />
                                    <p className="text-xs font-semibold text-ai uppercase tracking-widest">
                                        What you'll get
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-1.5 text-text-secondary">
                                        <div className="w-1 h-1 rounded-full bg-ai" />
                                        <span>14-day free trial</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-text-secondary">
                                        <div className="w-1 h-1 rounded-full bg-accent" />
                                        <span>Unlimited projects</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-text-secondary">
                                        <div className="w-1 h-1 rounded-full bg-success" />
                                        <span>AI analytics</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-text-secondary">
                                        <div className="w-1 h-1 rounded-full bg-warning" />
                                        <span>24/7 support</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-ai/20 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-text-muted" />
                                        <span className="text-text-muted text-xs">No credit card required</span>
                                    </div>
                                    <span className="text-ai font-semibold text-sm">Free →</span>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;