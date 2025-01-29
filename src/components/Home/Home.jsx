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
                            <h1 className="rules-heading">Rules</h1>

                            <h4 className="rule-subheading">Inventory & Collection</h4>
                            <ul className="rule-list">
                                <li>The Collection section displays all the cards available in the game.</li>
                                <li>The Inventory section stores the player’s details.</li>
                                <li>All cards owned by the player will be shown below their details.</li>
                                <li>Players can combine cards to create a higher rarity card.</li>
                                <li>Players can draw a card from the chest, which they receive after winning a game.</li>
                            </ul>
                            
                            <h4 className="rule-subheading">Game</h4>
                            <ul className="rule-list">
                                <li>Three game types are available, with options for 7, 11, or 15 cards.</li>
                                <li>The number of cards drawn will depend on the chosen game type.</li>
                                <li>Player cards will be drawn based on the unique cards in the player’s deck.</li>
                                <li>Computer cards will be drawn according to the rarity of the player’s cards.</li>
                                <li>At the start of game, player will take the first turn.</li>
                                <li>The player or computer will take the next turn, depending on who loses the current round.</li>
                                <li>During the player's turn, the player will select a card to play, followed by the selection of a stat.</li>
                                <li>During the computer’s turn, the player will select a card, while the computer will automatically select a stat.</li>
                                <li>The winner of each round will be determined by comparing the values of the selected stats.</li>
                                <li>The player with the higher overall score at the end of all rounds will be declared the winner of the game.</li>
                                <li>If the player wins the game, a chest will be awarded.</li>
                                <li>If the player loses, one card from the player’s deck will be forfeited.</li>
                            </ul>
                            
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
