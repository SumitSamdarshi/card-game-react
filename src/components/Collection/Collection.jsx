import React, { useState, useEffect } from "react";
import "./Collection.css";
import { apiService } from "../../service/user-service";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const images = require.context('../../images', false, /\.(png|jpe?g|gif)$/);

const Collection = () => {
    const navigate = useNavigate();

    const [activeCard, setActiveCard] = useState(null);
    const blurBg = activeCard != null ? { opacity: '25%' } : {};
    const [isLoading, setIsLoading] = useState(false);


    const handleCardClick = (card) => {
        setActiveCard(card);
    };

    const closeModal = () => {
        setActiveCard(null);
    };

    const [activeSection, setActiveSection] = useState("All");
    const [cards, setCards] = useState([]);

    const fetchCards = (section) => {

        setIsLoading(true);
        const getCardUrl = '/card-game/api/cards/' + (section !== "All" ? 'type/' + section.toLowerCase() : '');
        apiService
            .get(getCardUrl)
            .then((response) => {
                setTimeout(() => {
                    setIsLoading(false);
                }, 2);
                return response.json();
            })
            .then((data) => {
                if (data?.success === false) {
                    toast.error(data.message, {
                        style: {
                            backgroundColor: "black",
                            color: "#ea9828",
                        }
                    });
                    return;
                }
                setCards(data)
            })
            .catch(() => {
                toast.error("Something went wrong !!", {
                    style: {
                        backgroundColor: "black",
                        color: "#ea9828",
                    }
                });
                return;
            });
    };

    const handleBackClick = () => {
        navigate('/');
    };

    useEffect(() => {
        fetchCards(activeSection);
    }, [activeSection]);

    const activeImageSrc = activeCard ? images(`./${activeCard.cardId.toString().padStart(3, '0')}.png`) : null;

    return (
        <div className="collection-container">
            <div className="collection-heading-container">All Cards Available on this game</div>
            <IoMdArrowRoundBack onClick={handleBackClick} className="collection-back-icon" />
            <div className="collection-bar-container" style={blurBg}>
                {["All", "Common", "Rare", "Epic", "Mythic", "Legendary"].map((section) => (
                    <div
                        key={section}
                        className={`collection-bar-section ${activeSection === section ? "active" : ""}`}
                        onClick={() => setActiveSection(section)}
                    >
                        {section.toUpperCase()}
                    </div>
                ))}
            </div>
            <div className="collection-cards-container" style={blurBg}>
                {cards.map((card) => {
                    const imageSrc = images(`./${card.cardId.toString().padStart(3, '0')}.png`);

                    return (
                        <div key={card.cardId} className="collection-card" onClick={() => handleCardClick(card)}>
                            <img src={imageSrc} alt={card.name} className="collection-card-image" />
                        </div>
                    );
                })}
            </div>
            {activeCard && (
                <div className="collection-modal-overlay" onClick={closeModal}>
                    <div className="collection-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="collection-modal-card-content">
                            <img src={activeImageSrc} alt={activeCard.name} className="collection-card-image" loading="lazy" />
                        </div>
                    </div>
                </div>
            )}
            {isLoading && (
                <div className="collection-modal-overlay">
                    <ClipLoader size={50} color={"#3498db"} loading={isLoading} />
                </div>
            )}
        </div>
    );
};

export default Collection;

