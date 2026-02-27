import { useState, useEffect } from 'react';
import { Button, Menu } from 'antd';
import {
    LogOut,
    Clock,
    UsersRound,
    Bell,
} from 'lucide-react';
import { SettingOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FullLogolight from '../assets/FullLogolight.png';
import { useAuthStore } from '../store/authStore.js';
import { useThemeStore } from '../store/themeStore.js';
import { useUserStore } from '../store/userStore.js';

const AdminSideBar = ({setOpen}) => {
    const [selectedKey, setSelectedKey] = useState('1');
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();
    const location = useLocation();
    const { role , logout } = useAuthStore();
    const { darkMode } = useThemeStore();
    const { fetchUserData, username, pfpUrl, } = useUserStore();

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const path = location.pathname;
        const menuItem = menuItems.find(item => item.link === path);
        if (menuItem) {
            setSelectedKey(menuItem.key);
        }
    }, [location]);

    const menuItems = [
        {
            key: '1',
            icon: <UsersRound  className="w-5 h-5" />,
            label: 'Manage Users',
            link: '/dashboard/users',
        },
    ];

    const handleLogout = async () => {
        try{
            await logout();
            navigate('/login');
        }catch(err){
            console.error("Logout failed:", err);
        }
    };

    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const formattedDate = currentTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });


    const Logo = () =>{
        if (darkMode) {
            return <img src={FullLogolight} alt="Logo" className='h-30 w-auto object-contain'
            style={
            { filter: 'invert(1) brightness(1.1)'}
            }/>
        }
        return <img src={FullLogolight} alt="Logo" className='h-30 w-auto object-contain'/>
    }

    return (
        <div className={`h-screen flex flex-col w-72 bg-surface border-r border-border shadow-lg relative overflow-hidden`}>
            
            {/* Background decorative elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-primary/5 blur-[80px]" />
                <div className="absolute bottom-0 -left-20 w-48 h-48 rounded-full bg-ai/5 blur-[60px]" />
            </div>

            {/* Header with Logo */}
            <div className="h-20 flex items-center justify-between px-5 border-b border-border relative z-10">
                <div className="flex items-center gap-3">
                    <Logo />
                </div>

            </div>

            {/* User Profile Summary */}
            <div className="px-5 py-4 border-b border-border bg-surface-alt/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary-hover flex items-center justify-center text-white font-semibold">
                        <img src={pfpUrl} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-text">
                            { username }
                        </p>
                        <p className="text-xs text-text-muted">
                            {role === 'admin' ? 'Full Access' : 'Limited Access'}
                        </p>
                    </div>
                    <div className="relative">
                        <Bell className="w-5 h-5 text-text-muted hover:text-primary cursor-pointer transition-colors" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full text-[10px] text-white flex items-center justify-center">
                            3
                        </span>
                    </div>
                </div>
            </div>

            {/* Clock Widget */}
            <div className="mx-4 mt-4 p-3 bg-linear-to-br from-primary/5 to-ai/5 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                            Current Time
                        </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-surface-alt rounded-full text-text-secondary border border-border">
                        {formattedDate}
                    </span>
                </div>
                <div className="mt-2">
                    <span className="text-2xl font-bold text-text">{formattedTime}</span>
                </div>
            </div>

            {/* Main Navigation Menu */}
            <div className="flex-1 overflow-y-auto py-4 px-3 relative z-10">
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={(e) => setSelectedKey(e.key)}
                    items={menuItems.map((item) => ({
                        key: item.key,
                        icon: item.icon,
                        label: <Link to={item.link} className="text-sm font-medium">{item.label}</Link>,
                    }))}
                    className="border-r-0 bg-transparent custom-menu"
                />
            </div>

            {/* Bottom Section */}
            <div className="flex border-t border-border p-4 relative z-10">
                {/* Logout Button */}
                <Button
                    type="primary"
                    onClick={handleLogout}
                    className="w-full h-11 bg-error! border-error! hover:bg-red-600! hover:border-red-600! flex items-center justify-center gap-2 text-base font-medium rounded-xl shadow-lg shadow-error/20"
                    icon={<LogOut className="w-5 h-5" style={{transform : "rotateZ(180deg)"}} />}
                >
                    Logout
                </Button>
                <Button
                    type="text"
                    className='flex items-center justify-center ml-5 text-text-secondary hover:text-primary transition-colors duration-200'
                    icon={<SettingOutlined style={{fontSize : "24px" , color:"#3B82F6"}}/>}
                    onClick={() => setOpen(true)}>
                </Button>
            </div>
        </div>
    );
};

export default AdminSideBar;