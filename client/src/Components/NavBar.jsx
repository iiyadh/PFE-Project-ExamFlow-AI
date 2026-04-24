import { useState, useEffect } from 'react';
import { Avatar, Button, Dropdown } from 'antd';
import {
    User,
    LogOut,
    GraduationCap,
    BookOpen,
    Bell,
    Settings,
    ChevronDown,
    ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import FullLogolight from '../assets/FullLogolight.png';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import "../App.css";

const NavBar = ({ role, setOpen ,setProfileOpen }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { darkMode } = useThemeStore();
    const { logout } = useAuthStore();
    const { fetchUserData , username , pfpUrl  } = useUserStore();
    
    useEffect(() => {
        fetchUserData();
    }, []);
    
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);




    const handleLogout = async () => {
        try{
            await logout();
            navigate('/login');
        }catch(err){
            console.error("Logout failed:", err);
        }
    };

    const getRoleConfig = () => {
        switch(role) {
            case 'TEACHER':
                return {
                    icon: <GraduationCap className="w-5 h-5" />,
                    label: 'Teacher',
                    bgColor: 'bg-ai/10',
                    textColor: 'text-ai',
                };
            case 'STUDENT':
                return {
                    icon: <BookOpen className="w-5 h-5" />,
                    label: 'Student',
                    bgColor: 'bg-accent/10',
                    textColor: 'text-accent',
                };
            case 'ADMIN':
                return {
                    icon: <ShieldCheck className="w-5 h-5" />,
                    label: 'Admin',
                    bgColor: 'bg-primary/10',
                    textColor: 'text-primary',
                };
            default:
                return {
                    icon: <User className="w-5 h-5" />,
                    label: 'User',
                    bgColor: 'bg-info/10',
                    textColor: 'text-warning',
                };
        }
    };

    const roleConfig = getRoleConfig();

    const profileMenuItems = [
        {
            key: 'profile',
            icon: <User className="w-4 h-4" />,
            label: 'My Profile',
            onClick: () => setProfileOpen(true)
        },
        ...(role === 'STUDENT'
            ? [{
                key: 'exams',
                icon: <BookOpen className="w-4 h-4" />,
                label: 'My Exams',
                onClick: () => navigate('/student/exams')
            },
            {
                key: 'classes',
                icon: <GraduationCap className="w-4 h-4" />,
                label: 'My Classes',
                onClick: () => navigate('/student/classes')
            }
        ]
            : []),
        {
            key: 'settings',
            icon: <Settings className="w-4 h-4" />,
            label: 'Settings',
            onClick: () => setOpen(true)
        },
        {
            key: 'divider',
            type: 'divider'
        },
        {
            key: 'logout',
            icon: <LogOut className="w-4 h-4" />,
            label: 'Logout',
            danger: true,
            onClick: handleLogout
        }
    ];

    const Logo = () =>{
        if (darkMode) {
            return <img src={FullLogolight} alt="Logo" className="h-25 w-auto object-contain"
            style={
            { filter: 'invert(1) brightness(1.1)'}
            }/>
        }
        return <img src={FullLogolight} alt="Logo" className="h-25 w-auto object-contain"/>
    }

    return (
        <>
            <header 
                className={`
                    fixed top-0 left-0 right-0 z-50 transition-all duration-300
                    ${scrolled 
                        ? 'bg-surface/90 backdrop-blur-xl shadow-lg border-b border-border' 
                        : 'bg-surface/75 backdrop-blur-md border-b border-border/50'
                    }
                `}
            >
                {/* Background decorative elements */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/5 blur-[60px]" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-ai/5 blur-[60px]" />
                </div>

                {/* Subtle dot pattern */}
                <div 
                    className="pointer-events-none absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">

                        {/* Left section - Logo */}
                        <div className="flex items-center gap-4">
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="relative">
                                    <Logo />
                                    <div className="absolute inset-0 blur-xl" />
                                </div>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Role indicator */}
                            <div className={`hidden md:flex items-center gap-3 p-2 border border-border rounded-xl ${roleConfig.bgColor}`}>
                                <div className={roleConfig.textColor}>
                                    {roleConfig.icon}
                                </div>
                                <span className={`text-sm font-medium ${roleConfig.textColor}`}>
                                    {roleConfig.label}
                                </span>
                            </div>
                        </div>

                        {/* Hamburger menu for mobile */}
                        <button
                            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-border text-text-muted hover:bg-surface-alt transition-colors"
                            onClick={() => setMobileMenuOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            <div className="flex flex-col gap-1">
                                <span className={`block w-5 h-0.5 bg-current transition-all ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                                <span className={`block w-5 h-0.5 bg-current transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
                                <span className={`block w-5 h-0.5 bg-current transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
                            </div>
                        </button>

                        {/* Right section - User menu and actions */}
                        <div className="flex items-center gap-3">
                            {/* Notification Bell */}
                            <Button
                                type="text"
                                className="relative w-10 h-10 flex items-center justify-center text-text hover:bg-surface-alt border border-border rounded-xl"
                                icon={<Bell className="w-5 h-5" {...(darkMode && { style: { color: '#F1F5F9' } })} />}
                            >
                                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse" />
                            </Button>

                            {/* User Profile Dropdown */}
                            <Dropdown
                                menu={{ items: profileMenuItems }}
                                trigger={['click']}
                                placement="bottomRight"
                                arrow
                                className="cursor-pointer"
                            >
                                <div className="flex items-center gap-3 p-1 pr-3 rounded-xl hover:bg-surface-alt border border-transparent hover:border-border transition-all duration-200">
                                    <Avatar 
                                        size={40} 
                                        src={pfpUrl}
                                        icon={<User className="w-5 h-5" />}
                                        className="bg-linear-to-br from-primary to-primary-hover border-2 border-white shadow-md"
                                    />
                                    <div className="hidden sm:block">
                                        <p className="text-sm font-medium text-text">{username || 'User'}</p>
                                        <p className="text-xs text-text-muted">{roleConfig.label}</p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-text-muted hidden sm:block" />
                                </div>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-border bg-surface/95 backdrop-blur-xl">
                        <div className="px-4 py-3 space-y-3">
                            {/* Role indicator for mobile */}
                            <div className="flex items-center gap-3 p-3 border border-border rounded-xl">
                                <div className={`w-10 h-10 rounded-lg ${roleConfig.bgColor} flex items-center justify-center`}>
                                    <div className={roleConfig.textColor}>
                                        {roleConfig.icon}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-text-muted">Logged in as</p>
                                    <p className={`text-sm font-semibold ${roleConfig.textColor}`}>
                                        {roleConfig.label}
                                    </p>
                                </div>
                            </div>

                            {/* Mobile menu items */}
                            <Link
                                to={`/${role === 'ADMIN' ? 'admin' : role === 'TEACHER' ? 'teacher' : 'user'}/profile`}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-alt border border-transparent hover:border-border transition-all duration-200"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <User className="w-5 h-5 text-text-muted" />
                                <span className="text-sm font-medium text-text">My Profile</span>
                            </Link>

                            <Link
                                to="/settings"
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-alt border border-transparent hover:border-border transition-all duration-200"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Settings className="w-5 h-5 text-text-muted" />
                                <span className="text-sm font-medium text-text">Settings</span>
                            </Link>

                            <Button
                                type="primary"
                                onClick={handleLogout}
                                block
                                className="h-11 flex items-center justify-center gap-2 bg-error/10 border-error/20 text-error hover:bg-error hover:text-white rounded-xl font-medium"
                                icon={<LogOut className="w-4 h-4" />}
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                )}
            </header>

            {/* Spacer */}
            <div className="h-20" />
        </>
    );
};

export default NavBar;