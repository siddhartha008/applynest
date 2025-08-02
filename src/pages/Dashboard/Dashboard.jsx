import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { supabase } from "../../utils/client";

import SideBar from "../../components/sidebar/sidebar"
import Cards from "../../components/cards/cards"

const Dashboard = () => {
    

    return (
        <div className="dashboard-container">
            <div className="sidebar-section">
                <SideBar/>
            </div>
            <div className="main-content">
                <h1 className="headingText">ApplyNest</h1>
            
              <div className="cards-container">
                    <Cards/>
              </div>
             </div>
            
        </div>
    );
}



export default Dashboard; 