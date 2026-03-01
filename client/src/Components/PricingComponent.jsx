import { Button } from 'antd';
import { 
    Rocket, 
    Shield, 
    Sparkles,
    CheckCircle,
    Calendar,
    Clock,
    Timer,
    Brain,
    FileText,
    Award,
    BarChart3,
    Globe,
    Lock
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

const PricingComponent = () => {
    const [billingCycle, setBillingCycle] = useState('month'); // 'month', 'year', or '5year'
    const { isAuthenticated } = useAuthStore();

    const plans = [
        {
            name: 'Educator Basic',
            description: 'Perfect for individual teachers starting with AI-powered exam creation.',
            monthPrice: 29,
            yearPrice: 290,
            fiveYearPrice: 1300,
            icon: <Rocket className="w-6 h-6" />,
            color: 'accent',
            features: [
                'AI Exercise Generator (50 prompts/month)',
                'Course Upload & Markdown Conversion',
                'Basic Exam & Homework Dashboard',
                'Up to 30 students per class',
                'Google Drive Integration',
                'Email Support',
                'Basic Analytics'
            ],
            aiFeatures: ['Basic AI Grading Assistant'],
            savings: { year: '17%', fiveYear: '25%' },
            popular: false,
            buttonText: 'Start Teaching',
            target: 'teacher'
        },
        {
            name: 'Educator Pro',
            description: 'Advanced AI tools for comprehensive exam management and student engagement.',
            monthPrice: 99,
            yearPrice: 990,
            fiveYearPrice: 4455,
            icon: <Brain className="w-6 h-6" />,
            color: 'primary',
            features: [
                'AI Exercise Generator (200 prompts/month)',
                'Advanced Exam Scheduling',
                'Unlimited students per class',
                'Randomized Questions & Sets',
                'Contest & Leaderboard Features',
                'Real-time Announcements',
                'Advanced Analytics Dashboard',
                'Priority Support',
                'Google Drive Sync'
            ],
            aiFeatures: [
                'Advanced AI Grading Assistant',
                'AI Verification System',
                'Automated Feedback Generation'
            ],
            savings: { year: '17%', fiveYear: '25%' },
            popular: true,
            buttonText: 'Go Pro',
            target: 'teacher'
        },
        {
            name: 'Institution',
            description: 'Complete platform for schools and universities with full administrative control.',
            monthPrice: 499,
            yearPrice: 4990,
            fiveYearPrice: 22455,
            icon: <Globe className="w-6 h-6" />,
            color: 'ai',
            features: [
                'Unlimited AI Exercise Generation',
                'Multi-teacher Management',
                'Department & Class Organization',
                'Custom Branding',
                'API Access',
                'Advanced Security & Compliance',
                'Dedicated Account Manager',
                'SLA Guarantee',
                'Custom Integrations',
                'On-premise Deployment Option',
                'Advanced ML Analytics'
            ],
            aiFeatures: [
                'Custom AI Model Training',
                'Plagiarism Detection',
                'Predictive Performance Analytics'
            ],
            savings: { year: '17%', fiveYear: '25%' },
            popular: false,
            buttonText: 'Contact Sales',
            target: 'admin'
        }
    ];

    const calculatePrice = (plan) => {
        switch(billingCycle) {
            case 'month':
                return plan.monthPrice;
            case 'year':
                return plan.yearPrice;
            case '5year':
                return plan.fiveYearPrice;
            default:
                return plan.monthPrice;
        }
    };

    const calculateOriginalPrice = (plan) => {
        switch(billingCycle) {
            case 'year':
                return plan.monthPrice * 12;
            case '5year':
                return plan.monthPrice * 60;
            default:
                return plan.monthPrice;
        }
    };

    const getBillingLabel = () => {
        switch(billingCycle) {
            case 'month':
                return 'month';
            case 'year':
                return 'year';
            case '5year':
                return '5 years';
            default:
                return 'month';
        }
    };

    const getBillingIcon = () => {
        switch(billingCycle) {
            case 'month':
                return <Clock className="w-4 h-4" />;
            case 'year':
                return <Calendar className="w-4 h-4" />;
            case '5year':
                return <Timer className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getColorClasses = (color) => {
        switch(color) {
            case 'primary':
                return {
                    bg: 'bg-primary',
                    bgLight: 'bg-primary/10',
                    text: 'text-primary',
                    border: 'border-primary',
                    gradient: 'from-primary to-primary-hover',
                    shadow: 'shadow-primary/20',
                    light: 'primary'
                };
            case 'accent':
                return {
                    bg: 'bg-accent',
                    bgLight: 'bg-accent/10',
                    text: 'text-accent',
                    border: 'border-accent',
                    gradient: 'from-accent to-blue-400',
                    shadow: 'shadow-accent/20',
                    light: 'accent'
                };
            case 'ai':
                return {
                    bg: 'bg-ai',
                    bgLight: 'bg-ai/10',
                    text: 'text-ai',
                    border: 'border-ai',
                    gradient: 'from-ai to-purple-500',
                    shadow: 'shadow-ai/20',
                    light: 'ai'
                };
            default:
                return {
                    bg: 'bg-primary',
                    bgLight: 'bg-primary/10',
                    text: 'text-primary',
                    border: 'border-primary',
                    gradient: 'from-primary to-primary-hover',
                    shadow: 'shadow-primary/20',
                    light: 'primary'
                };
        }
    };

    const handleCheckout = () => {
        // Implement checkout logic here (e.g., redirect to payment gateway)
        alert('Checkout process initiated!');
    };

    return (
        <section className="relative min-h-screen bg-bg py-16 overflow-hidden">
            {/* Background decorative elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -right-32 w-130 h-130 rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute -bottom-40 left-1/4 w-100 h-100 rounded-full bg-ai/5 blur-[100px]" />
                <div className="absolute top-1/3 -left-24 w-90 h-90 rounded-full bg-accent/5 blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-success/5 blur-[80px]" />
            </div>

            {/* Subtle dot pattern */}
            <div 
                className="pointer-events-none absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 lg:mb-16">
                    {/* Decorative icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary to-ai flex items-center justify-center shadow-xl shadow-primary/20">
                                <Brain className="w-10 h-10 text-white" />
                            </div>
                            <div className="absolute -inset-1 bg-linear-to-br from-primary to-ai rounded-2xl blur-xl opacity-30" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-6">
                        AI-Powered{' '}
                        <span className="bg-linear-to-br from-primary to-ai bg-clip-text text-transparent">
                        Exam Platform
                        </span>
                        <br />for Modern Education
                    </h1>
                    
                    <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
                        Transform traditional learning with AI-generated exercises, real-time contests, 
                        and intelligent grading. Choose the plan that fits your educational needs.
                    </p>

                    {/* Billing Cycle Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="bg-surface-alt p-1.5 rounded-2xl border border-border inline-flex shadow-lg">
                            <button
                                onClick={() => setBillingCycle('month')}
                                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                                    billingCycle === 'month'
                                        ? 'bg-linear-to-br from-primary to-primary-hover text-white shadow-lg shadow-primary/20 scale-105'
                                        : 'text-text-secondary hover:text-text'
                                }`}
                            >
                                <Clock className="w-4 h-4" />
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('year')}
                                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                                    billingCycle === 'year'
                                        ? 'bg-linear-to-br from-primary to-primary-hover text-white shadow-lg shadow-primary/20 scale-105'
                                        : 'text-text-secondary hover:text-text'
                                }`}
                            >
                                <Calendar className="w-4 h-4" />
                                Yearly
                                <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full ml-1">
                                    Save 17%
                                </span>
                            </button>
                            <button
                                onClick={() => setBillingCycle('5year')}
                                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                                    billingCycle === '5year'
                                        ? 'bg-linear-to-br from-primary to-primary-hover text-white shadow-lg shadow-primary/20 scale-105'
                                        : 'text-text-secondary hover:text-text'
                                }`}
                            >
                                <Timer className="w-4 h-4" />
                                5 Years
                                <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full ml-1">
                                    Save 25%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Feature Tags */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
                            <Brain className="w-3 h-3" /> AI-Powered
                        </span>
                        <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm flex items-center gap-1">
                            <FileText className="w-3 h-3" /> PDF/DOCX Support
                        </span>
                        <span className="px-3 py-1 bg-ai/10 text-ai rounded-full text-sm flex items-center gap-1">
                            <Award className="w-3 h-3" /> Contests & Leaderboards
                        </span>
                        <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" /> Real-time Analytics
                        </span>
                        <span className="px-3 py-1 bg-warning/10 text-warning rounded-full text-sm flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Enterprise Security
                        </span>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 xl:gap-8">
                    {plans.map((plan, index) => {
                        const colors = getColorClasses(plan.color);
                        const price = calculatePrice(plan);
                        const originalPrice = calculateOriginalPrice(plan);
                        const savings = originalPrice - price;
                        const savingsPercent = Math.round((savings / originalPrice) * 100);
                        
                        return (
                            <div
                                key={index}
                                className="relative group"
                            >
                                {/* Card */}
                                <div className={`flex flex-col
                                    relative h-full bg-surface/80 backdrop-blur-xl 
                                    rounded-2xl border ${plan.popular ? 'border-warning/30' : 'border-border'}
                                    shadow-xl overflow-hidden transition-all duration-300
                                    hover:scale-105 hover:shadow-2xl
                                    ${plan.popular ? 'hover:shadow-warning/20' : `hover:shadow-${colors.light}/20`}
                                    group-hover:z-10
                                `}>
                                    {/* Inner decorative elements */}
                                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                                        <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full ${colors.bgLight} blur-[80px]`} />
                                        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-linear-to-br opacity-30 blur-[80px]" />
                                    </div>

                                    {/* Card Header */}
                                    <div className="p-8 border-b border-border">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-14 h-14 rounded-xl ${colors.bgLight} flex items-center justify-center`}>
                                                <div className={colors.text}>
                                                    {plan.icon}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-text">{plan.name}</h3>
                                                <p className="text-sm text-text-muted line-clamp-2">{plan.description}</p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="mt-4">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-5xl font-bold text-text">
                                                    ${price}
                                                </span>
                                                <span className="text-text-muted">/{getBillingLabel()}</span>
                                            </div>
                                            
                                            {/* Savings Badge */}
                                            {billingCycle !== 'month' && (
                                                <div className="mt-3 flex items-center gap-2">
                                                    <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
                                                        Save ${savings} ({savingsPercent}%)
                                                    </div>
                                                    <div className="text-text-muted line-through text-sm">
                                                        ${originalPrice}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* AI Feature Highlight */}
                                        <div className="mt-4 p-3 bg-linear-to-br from-ai/5 to-primary/5 rounded-xl border border-ai/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Brain className="w-4 h-4 text-ai" />
                                                <span className="text-xs font-semibold text-ai uppercase tracking-wider">
                                                    AI Features
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {plan.aiFeatures.map((feature, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs text-text-secondary">
                                                        <Sparkles className="w-3 h-3 text-ai" />
                                                        <span>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="p-8">
                                        <p className="text-sm font-medium text-text-muted mb-4 flex items-center gap-2">
                                            {getBillingIcon()}
                                            Everything included:
                                        </p>
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <CheckCircle className={`w-5 h-5 ${colors.text} shrink-0 mt-0.5`} />
                                                    <span className="text-text-secondary text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="p-8 pt-0 justify-end mt-auto">
                                        {!isAuthenticated && <Link to={`/register?plan=${plan.name.toLowerCase().replace(' ', '-')}&billing=${billingCycle}`}>
                                            <Button
                                                type="primary"
                                                block
                                                size="large"
                                                className={`
                                                    h-12 text-base font-semibold rounded-xl border-0
                                                    ${plan.popular 
                                                        ? 'bg-linear-to-br from-warning to-orange-400 hover:from-orange-400 hover:to-warning text-white' 
                                                        : `bg-linear-to-br ${colors.gradient} text-white`
                                                    }
                                                    shadow-lg ${plan.popular ? 'shadow-warning/20' : colors.shadow}
                                                    hover:scale-105 transition-all duration-200
                                                `}
                                            >
                                                {plan.buttonText}
                                            </Button>
                                        </Link>}
                                        {isAuthenticated && (
                                            <Button
                                                type="primary"
                                                block
                                                size="large"
                                                className={`
                                                    h-12 text-base font-semibold rounded-xl border-0
                                                    ${plan.popular
                                                        ? 'bg-linear-to-br from-warning to-orange-400 hover:from-orange-400 hover:to-warning text-white'
                                                        : `bg-linear-to-br ${colors.gradient} text-white`
                                                    }
                                                    shadow-lg ${plan.popular ? 'shadow-warning/20' : colors.shadow}
                                                    hover:scale-105 transition-all duration-200
                                                `}
                                                onClick={handleCheckout}
                                                disabled={plan.target === 'admin'} // Disable checkout for Institution plan (contact sales)
                                            >
                                                {plan.buttonText}
                                            </Button>
                                        )}

                                        {/* Free Trial */}
                                        <p className="text-xs text-text-muted text-center mt-4">
                                            <Shield className="w-3 h-3 inline mr-1" />
                                            14-day free trial • No credit card required
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PricingComponent;