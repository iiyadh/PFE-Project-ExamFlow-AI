import AdminSideBar from "../Components/AdminSideBar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import SettingsModal from '../Components/SettingsModal';

const AdminPage = () => {
    const [open,setOpen] = useState(false);
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full min-h-screen flex bg-bg">
            <AdminSideBar setOpen={setOpen}/>
            <Outlet />
            <SettingsModal open={open} setOpen={setOpen} />
        </div>
    );
};

export default AdminPage;