import React, { useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate("/login")
    };

    const handleRegisterClick = () => {
        navigate("/collection")
    };

    const [rulesClicked, setRulesClicked] = useState(false);
    const blurBg = rulesClicked === true ? { opacity: '25%' } : {};


    const handleRulesClick = () => {
        setRulesClicked(!rulesClicked);
    };

    const closeModal = () => {
        setRulesClicked(false);
    };

    return (
        <div className="home-container">
            <div className="home-sub-container">
                <div className="home-center-buttons" style={blurBg}>
                    <button className="home-action-button" onClick={handleLoginClick}>
                        Login / Register
                    </button>
                    <button className="home-action-button" onClick={handleRegisterClick}>
                        Collections
                    </button>
                    <button className="home-action-button" onClick={handleRulesClick}>
                        Rules
                    </button>
                </div>
            </div>
            {rulesClicked && (
                <div className="home-modal-overlay" onClick={closeModal}>
                    <div className="home-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="home-modal-card-content">
                            <h3>Rules</h3>
                            <p>Additional details about this card.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
