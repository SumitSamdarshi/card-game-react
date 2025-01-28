import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { doLogOut, getCurrentUser, updateUser } from "../../auth/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IoMdArrowRoundBack } from "react-icons/io";
import { apiService } from "../../service/user-service";
import { ClipLoader } from "react-spinners";

const Dashboard = () => {
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [cardData, setCardData] = useState([]);
    const [isCardsAssigned, setIsCardsAssigned] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const gameTypes = ['7v7', '11v11', '15v15'];


    const handleOptionSelect = (type) => {
        setDropdownOpen(false);
        navigate("/player/game", { state: type })
    };

    const handleInventoryClick = () => {
        navigate("/player/inventory")
    };

    const handleLogoutClick = () => {
        doLogOut(() => {
            toast.success("LogOut Successful !")
            navigate("/login")
        })
    };

    const handleBackClick = () => {
        navigate('/');
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const assignCards = (user) => {
        if (isCardsAssigned) {
            return;
        }
        setIsLoading(true);
        apiService.get(`/card-game/api/users/assign/${user.user_id}`)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data?.success === false) {
                    toast.error(data.message);
                    return;
                }
                setCardData(data.cards);
                updateUser(data.user);
                setIsModalVisible(true);
                setIsCardsAssigned(true);
            })
            .catch((error) => {
                console.error('Error during registration:', error);
            });
            setIsLoading(false);
    }

    useEffect(() => {
        const user = getCurrentUser();
        const noOfCards = user?.noOfCards;
        if (noOfCards === 0) {
            assignCards(user);
        }
    }, []);

    return (
        <div className="dashboard-container">
            {isModalVisible && (
                <div className="dashoard-modal-overlay">
                    <div className="dashoard-modal-content">
                        <p>You got these cards as starter:</p>
                        <div className="dashoard-cards-container">
                            {cardData.map((card) => (
                                <div key={card.cardId} className="dashoard-card-wrapper">
                                    <img className="dashoard-card" src={'https://card-game-production.up.railway.app/card-game/api/cards/image/card/' + card.cardImage} alt={`dashboard-card ${card.Id}`} />
                                </div>
                            ))}
                        </div>
                        <button className="dashoard-modal-button" onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}

            <IoMdArrowRoundBack onClick={handleBackClick} className="dashboard-back-icon" />
            <div className="dashboard-top-right-buttons">
                <button className="dashboard-logout-button" onClick={handleLogoutClick}>
                    Logout
                </button>
            </div>

            <div className="dashboard-sub-container">

                <div className="dashboard-center-buttons">
                    {isDropdownOpen && (
                        <div className="dashboard-sub-container-text">
                            Select Game Type
                        </div>
                    )}
                    <div className="dropdown-container">
                        <button
                            className="dashboard-action-button"
                            onClick={() => setDropdownOpen(!isDropdownOpen)}
                        >
                            Play Game
                        </button>
                        {isDropdownOpen && (
                            <ul className="dropdown-menu">
                                {gameTypes.map((type) => (
                                    <li
                                        key={type}
                                        className="dropdown-item"
                                        onClick={() => handleOptionSelect(type)}
                                    >
                                        {type}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button className="dashboard-action-button" onClick={handleInventoryClick}>
                        Inventory
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="dashboard-modal-overlay">
                    <ClipLoader size={50} color={"#3498db"} loading={isLoading} />
                </div>
            )}

        </div>
    );
};

export default Dashboard;
