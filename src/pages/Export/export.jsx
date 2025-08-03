import React from "react";
import SideBar from "../../components/sidebar/sidebar";

const Export = (user) => {
    return (
        <div>
             <div className="sidebar-section">
                <SideBar name = {user['user'].user_metadata['first_name']}/>
            </div>
            <h1>Export</h1>
        </div>
    )
}

export default Export; 