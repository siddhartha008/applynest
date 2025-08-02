import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { supabase } from "../../utils/client";

const Dashboard = () => {
    const[isLoggedOut, setLoggedOut] = useState("false");

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
        <div>
            <h1 className="headingText">ApplyNest</h1>
            <button onClick={handleLogOut}>Log Out</button>
        </div>
    );
}



export default Dashboard; 