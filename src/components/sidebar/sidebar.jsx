import React, { useState } from "react"
import {supabase} from "../../utils/client"
import { LayoutDashboard, School, Settings, UserRound, UserRoundPen } from "lucide-react"
import "./sidebar.css"

const SideBar = () => {
    const [selectedNav, setSelectedNav] = useState('dashboard');


    const handleLogOut = async (e) => { 
        e.preventDefault()
       const {error} = await supabase.auth.signOut();
       if (error) { 
            alert("Error logging out")
       } else { 
        alert("Signed Out");
       }
    }


    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <UserRound size={24} color="#123458"/>
                <h3>Welcome, User</h3>
            </div>
            <nav className="sidebar-nav">
                <div
                    className={`nav-div ${selectedNav === 'dashboard' ? 'selected' : ''}`}
                    onClick={() => setSelectedNav('dashboard')}
                >
                    <LayoutDashboard/>
                    <a href="/dashboard" className="nav-link">Home</a>
                </div>
                <div
                    className={`nav-div ${selectedNav === 'applications' ? 'selected' : ''}`}
                    onClick={() => setSelectedNav('applications')}
                >
                    <School/>
                    <a href="/applications" className="nav-link">Applications</a>
                </div>
                <div
                    className={`nav-div ${selectedNav === 'profile' ? 'selected' : ''}`}
                    onClick={() => setSelectedNav('profile')}
                >
                    <UserRoundPen/>
                    <a href="/profile" className="nav-link">Profile</a>
                </div>
                <div
                    className={`nav-div ${selectedNav === 'settings' ? 'selected' : ''}`}
                    onClick={() => setSelectedNav('settings')}
                >
                    <Settings/>
                    <a href="/settings" className="nav-link">Settings</a>
                </div>

            </nav>
            <button onClick={handleLogOut} className="logout-btn">Log Out</button>
        </div>
    )
}

export default SideBar;