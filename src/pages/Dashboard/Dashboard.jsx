import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { supabase } from "../../utils/client";

import SideBar from "../../components/sidebar/sidebar"
import Cards from "../../components/cards/cards"
import AddUni from "../../components/adduni/addUni"
import Search from "../Search/Search";

const Dashboard = (user) => {
    const [showAddUni, setShowAddUni] = useState(false);
    const [universities, setUniversities] = useState([]);

    // Function to handle closing the modal
    const handleCloseAddUni = () => {
        setShowAddUni(false);
    };

    // Function to handle successful university addition
    const handleUniAdded = () => {
        fetchUniversities(); // Refresh the list
        setShowAddUni(false); // Close the modal
    };

    useEffect(() => {
        fetchUniversities();
    }, [user]);

    const fetchUniversities = async () => {
        try {
            const { data, error } = await supabase
                .from('universities')
                .select('*')
                .eq('user_id', user['user'].id)

            if (error) throw error;
            setUniversities(data);
        } catch (error) {
            console.error('Error fetching universities:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar-section">
                <SideBar name = {user['user'].user_metadata['first_name']}/>
            </div>
            <div className="main-content">
                <h1 className="headingText">ApplyNest</h1>
            
              <div className="cards-container">
                 {universities.length > 0 ? (
                    universities.map((university) => (
                        <Cards school={university} />
                    ))
                ) : (
                    <p>No universities added yet.</p>
                )}
              </div>
             </div>
             {/* Floating Add Button */}
             <div className="floating-add-btn" onClick={() => setShowAddUni(true)}>
                <span className="tooltip">Add a school</span>
            </div>
            {showAddUni && (
                <div className="modal-overlay" onClick={handleCloseAddUni}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={handleCloseAddUni}>
                            ×
                        </button>
                        <AddUni 
                            onClose={handleCloseAddUni}
                            onUniAdded={handleUniAdded}
                            user={user}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}



export default Dashboard; 