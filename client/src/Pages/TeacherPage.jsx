import NavBar from "../Components/NavBar";
import { useState } from "react";
import SettingsModal from '../Components/SettingsModal';
import ProfileModal from '../Components/ProfileModal';



const TeacherPage = () =>{
    const [open,setOpen] = useState(false);
    const [profileOpen,setProfileOpen] = useState(false);
    
    return (
        <div className="w-full min-h-screen flex bg-bg">
            <NavBar role="TEACHER" setOpen={setOpen} setProfileOpen={setProfileOpen}/>
            <SettingsModal open={open} setOpen={setOpen}  />
            <ProfileModal open={profileOpen} setOpen={setProfileOpen} />
        </div>
    )
}

export default TeacherPage;