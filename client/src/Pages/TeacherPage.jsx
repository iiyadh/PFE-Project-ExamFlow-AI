import NavBar from "../Components/NavBar";
import { useState } from "react";
import SettingsModal from '../Components/SettingsModal';
import ProfileModal from '../Components/ProfileModal';
import { Navigate, Outlet } from "react-router-dom";



const TeacherPage = () =>{
    const [open,setOpen] = useState(false);
    const [profileOpen,setProfileOpen] = useState(false);
    
    return (
        <div className="w-full min-h-screen flex bg-bg flex-col">
            <NavBar role="TEACHER" setOpen={setOpen} setProfileOpen={setProfileOpen}/>
            <SettingsModal open={open} setOpen={setOpen}  />
            <ProfileModal open={profileOpen} setOpen={setProfileOpen} />
            <Outlet />
        </div>
    )
}

export default TeacherPage;