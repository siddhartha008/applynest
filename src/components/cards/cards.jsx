import React, { useState, useEffect } from "react"
import "./cards.css"

import {supabase} from '../../utils/client.js'
import AddUni from "../adduni/addUni.jsx"

const Cards = () => {
    const [schools, setSchools] = useState([])
    const [user, setUser] = useState(null)
    const [showAddUni, setShowAddUni] = useState(false);
    
    const handleAddUni = () => {
        setShowAddUni(true);
    };

    // Function to handle closing the modal
    const handleCloseAddUni = () => {
        setShowAddUni(false);
    };

    // Function to handle successful university addition
    const handleUniAdded = () => {
        fetchSchools(); // Refresh the list
        setShowAddUni(false); // Close the modal
    };

    const fetchSchools = async () => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                console.log('No user logged in')
                return
            }

            setUser(user)

            // Fetch universities for the current user
            const {data, error} = await supabase
                .from('universities')
                .select('*')
                .eq('user_id', user.id)

            if (error) throw error;
            setSchools(data)
        }
        catch (error) {
            console.log('Error fetching schools:', error)
        }
    }

    useEffect(() => {
        fetchSchools();
    }, []);

    const handleAddSchool = async () => {
        try {
            if (!user) {
                console.log('No user logged in')
                return
            }

            const newUniversity = {
                uniName: 'Harvard',
                uniCity: 'Boston, MA',
                programName: 'Computer Science',
                deadline: '2024-12-31',
                tuition: 90000,
                user_id: user.id
            }

            const { data, error } = await supabase
                .from('universities')
                .insert([newUniversity])

            if (error) throw error

            console.log('University added:', data)
            // Refresh the list
            fetchSchools()
        } catch (error) {
            console.log('Error adding school:', error)
        }
    };

    return (
        <div>
            <div className="cards-container">
                {schools.length > 0 ? (
                    schools.map((school, index) => (
                        <div key={school.id || index} className="cards">
                            <h2>{school.uniName || 'Uni Name'}</h2>
                            <p>📍 {school.uniCity || 'Uni Location'}</p>
                            <p>🎓 {school.programName || 'Program Desc'}</p>
                            <p>💰 ${school.tuition || 'Tuition'}</p>
                            <p>📅 {school.deadline || 'Deadline to Apply'}</p>
                        </div>
                    ))
                ) : (
                    <div className="cards empty-state">
                        <div className="empty-icon">🎓</div>
                        <h2>No Universities Added</h2>
                        <p>Click the + button to add your first university</p>
                        <button className="add-first-btn" onClick={() => setShowAddUni(true)}>
                            Add University
                        </button>
                    </div>
                )}
            </div>

            {/* Floating Add Button */}
            <div className="floating-add-btn" onClick={() => setShowAddUni(true)}>
                <span className="tooltip">Add a school</span>
            </div>

            {/* THIS IS WHAT WAS MISSING - The modal rendering */}
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
    )
}

export default Cards;