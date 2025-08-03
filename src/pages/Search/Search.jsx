import React, { useState, useEffect } from "react"
import SideBar from "../../components/sidebar/sidebar";
import axios from "axios";
import "./Search.css";

const Search = (user) => { 
    const [universities, setUniversities] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);


    const searchUni = async(e) => { 
        if (!searchQuery.trim()) return; 
        setLoading(true);
        try { 
            const response = await axios.get(`http://universities.hipolabs.com/search?name=${searchQuery}`, {
                params: {
                    name: searchQuery
                }
            });
            setUniversities(response.data);
            setLoading(false);
        } catch (error) { 
            console.error('Error searching universities:', error);
        } finally { 
            setLoading(false); 
        }
    }; 

    useEffect(() => { 
        searchUni();
    }, [searchQuery]);

    return (
        <div className="search-container">
            <div className="sidebar-section">
                <SideBar name={user['user'].user_metadata['first_name']}/>
            </div>
            <div className="main-content">
                <h1 className="headingText">Search Universities</h1>
                <div className="search-section">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a university"
                        className="search-input"
                    />
                    <button onClick={searchUni} className="search-button">Search</button>
                </div>

                <div className="results-section">
                    {loading ? (
                        <p className="loading-text">Loading...</p>
                    ) : (
                        <ul className="university-list">
                            {universities.map((uni, index) => (
                                <li key={index} className="university-item">
                                    <h3>{uni.name}</h3>
                                    <p>{uni.country}</p>
                                    {uni.web_pages && uni.web_pages[0] && (
                                        <a href={uni.web_pages[0]} target="_blank" rel="noopener noreferrer">
                                            Visit Website
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Search;