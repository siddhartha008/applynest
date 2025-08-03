import React, { useState, useEffect } from "react"
import "./cards.css"
import { Trash } from "lucide-react";
import { supabase } from "../../utils/client";

const Cards = ({school}) => {
    const [daysLeft, setDaysLeft] = useState(0);
    useEffect(() => {
        const calculateDaysLeft = () => {
            const deadline = new Date(school.deadline);
            const today = new Date();
            const timeDiff = deadline - today;
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            setDaysLeft(daysDiff);
        };
    
        calculateDaysLeft();
    }, [school.deadline]);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this university?"); 
        if (!confirmDelete) return;
        try { 
            const {error} = await supabase.from('universities').delete().eq('id', id);
            if (error) throw error;
            alert("University deleted");
            window.location.reload();
            console.log(`University deleted ${id}`);
        } catch (error) { 
            console.error('Error deleting university:', error);
        }
    }
    
    return (
        <div>
            <div className="cards-container">
                        <div className="cards">
                            <h2>{school.uniName || 'Uni Name'}</h2>
                            <p>{school.uniCity || 'Uni Location'}</p>
                            <p>{school.programName || 'Program Desc'}</p>
                            <p>${school.tuition || 'Tuition'}</p>
                            <p>{daysLeft} days left to apply</p>
                            
                            <div className="delete-btn" onClick={() => handleDelete(school.id)}> 
                                <Trash/>
                            </div>

                        </div>
                       
            </div>

           
        </div>
    )
}

export default Cards;