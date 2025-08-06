import React from "react";
import SideBar from "../../components/sidebar/sidebar";
import "./export.css";

const Export = (user) => {
    return (
        <div className="export-container">
             <div className="sidebar-section">
                <SideBar name = {user['user'].user_metadata['first_name']}/>
            </div>
            <div className="main-content2">
                <h1 className="headingExport">*working on it* Users can export their university data to and from Google Sheets with CSV soon.</h1>
            </div>
        </div>
    )
}

export default Export; 