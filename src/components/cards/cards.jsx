import React, { useState, useEffect } from "react"
import "./cards.css"
import { Trash } from "lucide-react";
import { supabase } from "../../utils/client";

const formatTuition = (tuition) => {
    return tuition ? `$${Number(tuition).toLocaleString()}` : 'Tuition';
};

const Cards = ({school}) => {
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        const calculateDaysLeft = () => {
            if (school.deadline) {
                const deadline = new Date(school.deadline);
                const today = new Date();
                const timeDiff = deadline.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                setDaysLeft(daysDiff);
            }
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
        <div className="cards">
            <div className="card-header">
                <h2 className="card-title">{school.uniName || 'Uni Name'}</h2>
                <p className="card-location">{school.uniCity || 'Location'}</p>
            </div>
            
            <div className="card-body">
                <p>{school.programName || 'Program Description'}</p>
                <p className="card-tuition">{formatTuition(school.tuition)}</p>
            </div>
            
            <div className="card-footer">
                <p className="card-deadline">{daysLeft >= 0 ? `${daysLeft} days left to apply` : 'Deadline passed'}</p>
                <div className="delete-btn" onClick={() => handleDelete(school.id)}> 
                    <Trash size={20} />
                </div>
            </div>
        </div>
    )
}

export default Cards;