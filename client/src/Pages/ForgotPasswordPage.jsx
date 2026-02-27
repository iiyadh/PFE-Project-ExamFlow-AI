import { Form, Input, Button } from 'antd';
import { Mail, Sparkles, Shield, RotateCcw, CheckCircle } from 'lucide-react';
import FullLogolight from '../assets/FullLogolight.png';
import MobileVersionlight from '../assets/MobileVersionlight.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore.js';
import  api  from '../lib/api.js';

const ForgotPasswordPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate();
    const { darkMode } = useThemeStore();

    const onFinish = async (values) => {
        setLoading(true);
        try{
            await api.post('/password/forgot', { email: values.email });
        }catch(err){
            console.error(err);
        }finally{
            setLoading(false);
            setEmailSent(true);
        }
    };

    const handleResendEmail = async () => {
        setLoading(true);
        try{
            await api.post('/password/forgot', { email: form.getFieldValue('email') });
        }catch(err){
            console.error(err);
        }
        setLoading(false);
    };

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
                <div className="absolute -top-32 -left-32 w-130 h-130 rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute -bottom-40 right-1/4 w-100 h-100 rounded-full bg-warning/10 blur-[100px]" />
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
                    <Logo className="mb-8" />

                    <h1 className="text-5xl font-bold text-text mb-5 leading-tight tracking-tight">
                        Forgot Password?
                    </h1>
                    <p className="text-lg text-text-secondary leading-relaxed border-l-4 border-warning pl-6">
                        Don't worry! It happens to the best of us. Enter your email address 
                        and we'll send you instructions to reset your password securely.
                    </p>

                    {/* Security Highlights */}
                    <div className="mt-12 space-y-4">
                        {[
                            {
                                icon: <Shield className="w-4 h-4 text-success" />,
                                bg: 'bg-success/10',
                                label: 'End-to-end encrypted recovery',
                            },
                            {
                                icon: <RotateCcw className="w-4 h-4 text-accent" />,
                                bg: 'bg-accent/10',
                                label: 'Reset link expires in 24 hours',
                            },
                            {
                                icon: <Sparkles className="w-4 h-4 text-ai" />,
                                bg: 'bg-ai/10',
                                label: 'No account? Create one in minutes',
                            },
                        ].map(({ icon, bg, label }, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-3 rounded-xl bg-surface/60 border border-border/50 backdrop-blur-sm hover:border-warning/30 transition-colors duration-200"
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
                            { value: '99.9%', label: 'Success Rate' },
                            { value: '15 min', label: 'Avg Response' },
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

            {/* Right Section - Forgot Password Form */}
            <div className="flex-1 h-full flex flex-col items-center justify-center p-12 relative">

                {/* Corner accent */}
                <div className="pointer-events-none absolute top-8 right-8 w-24 h-24 border-t-2 border-r-2 border-warning/20 rounded-tr-2xl" />
                <div className="pointer-events-none absolute bottom-8 left-8 w-24 h-24 border-b-2 border-l-2 border-warning/20 rounded-bl-2xl" />


                <div className="lg:hidden">
                    <MobileLogo />
                </div>

                <div className="w-full max-w-md relative z-10">
                    {/* Form Container */}
                    <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-border relative overflow-hidden">

                        {/* Inner top-right glow */}
                        <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-warning/10 blur-[60px]" />

                        {!emailSent ? (
                            <>
                                <h2 className="text-3xl font-bold text-text mb-1 relative z-10">Reset Password</h2>
                                <p className="text-text-secondary mb-8 relative z-10">
                                    Remember your password?{' '}
                                    <Button
                                        type="link"
                                        className="p-0! h-auto! text-warning hover:text-primary-hover font-medium"
                                        onClick={ () => navigate('/login') }
                                    >
                                        Sign in
                                    </Button>
                                </p>

                                <Form
                                    form={form}
                                    name="forgotPassword"
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
                                        className="mb-8!"
                                    >
                                        <Input
                                            prefix={<Mail className="w-5 h-5 text-text-muted" />}
                                            placeholder="Email Address"
                                            className="bg-surface-alt! border-border! text-text! hover:border-warning! focus:border-warning! focus:shadow-none!"
                                        />
                                    </Form.Item>

                                    {/* Submit Button */}
                                    <Form.Item className="mb-4!">
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            block
                                            className="bg-warning! border-warning! hover:bg-orange-500! hover:border-orange-500! h-12! text-base! font-semibold!"
                                        >
                                            Send Reset Instructions
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </>
                        ) : (
                            // Success State
                            <div className="relative z-10 text-center py-8">
                                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-success" />
                                </div>
                                
                                <h2 className="text-2xl font-bold text-text mb-3">Check Your Email</h2>
                                <p className="text-text-secondary mb-6">
                                    We've sent password reset instructions to:<br />
                                    <span className="text-warning font-medium">{form.getFieldValue('email')}</span>
                                </p>
                                
                                <div className="bg-surface-alt rounded-xl p-5 mb-6 border border-border">
                                    <p className="text-sm text-text-secondary mb-3">
                                        Didn't receive the email?
                                    </p>
                                    <Button
                                        type="primary"
                                        onClick={handleResendEmail}
                                        loading={loading}
                                        className="bg-surface! border-border! text-text! hover:text-warning! hover:border-warning! mb-2"
                                        block
                                    >
                                        Resend Email
                                    </Button>
                                    <Button
                                        type="link"
                                        href="/login"
                                        className="text-text-secondary hover:text-warning! p-0! h-auto! bg-transparent! border-0! mt-2"
                                    >
                                        Return to Login
                                    </Button>
                                </div>

                                <div className="text-xs text-text-muted">
                                    <p>The reset link will expire in 24 hours.</p>
                                    <p>If you continue to have issues, contact support.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;