import React from "react";
import SideBar from "../../components/sidebar/sidebar";

const Profile = (user) => {
    return (
        <div>
            <div className="sidebar-section">
                <SideBar name = {user['user'].user_metadata['first_name']}/>
            </div>
            <h1>Profile</h1>
        </div>
    )
}


export default Profile; 