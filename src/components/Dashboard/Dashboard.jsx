import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { addPvp, doLogOut, getCurrentUser, updateUser } from "../../auth/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IoMdArrowRoundBack } from "react-icons/io";
import { apiService } from "../../service/user-service";
import { ClipLoader } from "react-spinners";
import { PiSpeakerHighFill, PiSpeakerSlashFill } from "react-icons/pi";
import { playClickSound, useMusic } from "../Music/MusicProvider";

const images = require.context('../../images', false, /\.(png|jpe?g|gif)$/);

const Dashboard = () => {
    const navigate = useNavigate();
    const { isMusicPlaying, toggleMusic } = useMusic();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [cardData, setCardData] = useState([]);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const gameTypes = ['7v7', '11v11', '15v15'];
    const [customSelect, setCustomSelect] = useState(false);
    const [allDistinctCards, setAllDistinctCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [isPvpDropdownOpen, setPvpDropdownOpen] = useState(false);
    const [createInput, setCreateInput] = useState('');
    const [joinInput, setJoinInput] = useState('');


    const handleOptionSelect = (type) => {
        setDropdownOpen(false);
        navigate("/player/game", {
            state: {
                'type': type,
            }
        })
    };

    const handleInventoryClick = () => {
        if (isMusicPlaying) {
            playClickSound();
        }
        navigate("/player/inventory")
    };

    const handleLogoutClick = () => {
        if (isMusicPlaying) {
            playClickSound();
        }
        doLogOut(() => {
            toast.success("LogOut Successful !", {
                style: {
                    backgroundColor: "black",
                    color: "#ea9828",
                }
            })
            navigate("/login")
        })
    };

    const handleBackClick = () => {
        navigate('/');
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedCards([]);
        setCustomSelect(false);
    };

    const handleCustomSelect = () => {
        if (isMusicPlaying) {
            playClickSound();
        }
        const user = getCurrentUser();
        setIsLoading(true);
        apiService.get(`/card-game/api/cards/distinct/user/${user.user_id}`)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log("distinct cards : ", data);
                if (data?.success === false) {
                    toast.error(data.message, {
                        style: {
                            backgroundColor: "black",
                            color: "#ea9828",
                        }
                    });
                    return;
                }
                setCustomSelect(true);
                setAllDistinctCards(data);
            })
            .catch(() => {
                toast.error("Something went wrong !!", {
                    style: {
                        backgroundColor: "black",
                        color: "#ea9828",
                    }
                });
            });
        setIsLoading(false);
    }

    const handleCardClick = (card) => {
        console.log("selected card : ", selectedCards);
        if (selectedCards.some((c) => c.cardId === card.cardId)) {
            setSelectedCards(selectedCards.filter((c) => c.cardId !== card.cardId));
        } else {
            setSelectedCards([...selectedCards, card]);
        }
    }

    const handleCustomPlay = () => {
        if (isMusicPlaying) {
            playClickSound();
        }
        navigate("/player/game", {
            state: {
                'type': 'custom',
                'data': selectedCards
            }
        })
    }

    const handleCreate = () => {
        if (createInput < 5) {
            toast.error("Min. 5v5 card game possible", {
                style: {
                    backgroundColor: "black",
                    color: "#ea9828",
                }
            });
            return;
        }
        if (isMusicPlaying) {
            playClickSound();
        }
        setPvpDropdownOpen(false);
        console.log("create : ", createInput);
        addPvp("p1");
        navigate("/player/pvp", {
            state: {
                'create': createInput
            }
        });
    }

    const handleJoin = () => {
        if (isMusicPlaying) {
            playClickSound();
        }
        addPvp("p2");
        setPvpDropdownOpen(false);
        navigate("/player/pvp", {
            state: {
                'join': joinInput
            }
        });
    }

    useEffect(() => {
        const assignCards = (user) => {
            setIsLoading(true);
            apiService.get(`/card-game/api/users/assign/${user.user_id}`)
                .then((response) => {
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
                    setCardData(data.cards);
                    updateUser(data.user);
                    setIsModalVisible(true);
                })
                .catch(() => {
                    toast.error("Something went wrong !!", {
                        style: {
                            backgroundColor: "black",
                            color: "#ea9828",
                        }
                    });
                });
            setIsLoading(false);
        }
        const user = getCurrentUser();
        const noOfCards = user?.noOfCards;
        if (noOfCards === 0) {
            assignCards(user);
        }
    }, []);

    const handleDropdown = () => {
        if (isMusicPlaying) {
            playClickSound();
        }
        setDropdownOpen(!isDropdownOpen)
        setPvpDropdownOpen(false);
    }

    const handlePvpDropdown = () => {
        if (isMusicPlaying) {
            playClickSound();
        }
        setPvpDropdownOpen(!isPvpDropdownOpen);
        setDropdownOpen(false)
    }

    return (
        <div className="dashboard-container">
            <div className="sound-back" onClick={toggleMusic} style={{ cursor: 'pointer' }}>
                <IoMdArrowRoundBack onClick={handleBackClick}/>
                {isMusicPlaying ? (
                    <PiSpeakerHighFill className="sound-icon" />
                ) : (
                    <PiSpeakerSlashFill className="sound-icon" />
                )}
            </div>
            {isModalVisible && (
                <div className="dashoard-modal-overlay">
                    <div className="dashoard-modal-content">
                        <div className="dashboard-custom-text">You got these cards as starter: </div>
                        <div className="dashoard-cards-container">
                            {cardData.map((card) => {
                                const imageSrc = images(`./${card.cardId.toString().padStart(3, '0')}.png`);

                                return (
                                    <div key={card.cardId} className="dashoard-card-wrapper">
                                        <img src={imageSrc} alt={card.name} className="dashoard-card" />
                                    </div>
                                );
                            })}
                        </div>
                        <button className="dashoard-modal-button" onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}

            {customSelect && (<div className="dashoard-modal-overlay">
                <div className="dashoard-modal-content">
                    <div className="dashboard-custom-text">Select cards you want to play with (min:5) </div>
                    <div className="dashboard-note-container">
                        <div className="dashboard-note-card">
                            <span className="dahboard-note-text">Cards Selected : {selectedCards.length}</span>
                        </div>
                        <button className="dashboard-rounded-button" onClick={handleCustomPlay} disabled={selectedCards.length < 5}>Play</button>
                    </div>
                    <div className="dashoard-custom-cards-container">

                        {allDistinctCards.map((card) => {
                            const imageSrc = images(`./${card.cardId.toString().padStart(3, '0')}.png`);

                            return (
                                <div key={card.cardId} className={`dashoard-custom-card-wrapper ${selectedCards.some((c) => c.cardId === card.cardId) ? "selected" : ""}`} onClick={() => handleCardClick(card)}>
                                    <img src={imageSrc} alt={card.name} className="dashoard-card" />
                                </div>
                            );
                        })}
                    </div>
                    <button className="dashoard-modal-button" onClick={closeModal}>Close</button>
                </div>
            </div>
            )}

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
                    {isPvpDropdownOpen && (
                        <div className="dashboard-sub-container-text">
                            Create or Join Game
                        </div>
                    )}
                    <div className="dropdown-container">
                        <button
                            className="dashboard-action-button"
                            onClick={handleDropdown}
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
                                <li
                                    key={"Custom"}
                                    className="dropdown-item"
                                    onClick={handleCustomSelect}
                                >
                                    Custom
                                </li>
                            </ul>
                        )}
                    </div>
                    <div className="dropdown-container">
                        <button
                            className="dashboard-action-button"
                            onClick={handlePvpDropdown}
                        >
                            Play PvP
                        </button>
                        {isPvpDropdownOpen && (
                            <ul className="pvp-dropdown-menu">
                                <li key="create" className="pvp-dropdown-item">
                                    <div className="dropdown-input-container">
                                        <input
                                            type="text"
                                            placeholder="Enter Game Size"
                                            className="dropdown-input"
                                            value={createInput}
                                            onChange={(e) => setCreateInput(e.target.value)}
                                        />
                                        <button className="dropdown-submit-btn" onClick={handleCreate}>Create</button>
                                    </div>
                                </li>
                                <li key="join" className="pvp-dropdown-item">
                                    <div className="dropdown-input-container">
                                        <input
                                            type="text"
                                            placeholder="Enter Game Code"
                                            className="dropdown-input"
                                            value={joinInput}
                                            onChange={(e) => setJoinInput(e.target.value)}
                                        />
                                        <button className="dropdown-submit-btn" onClick={handleJoin}>Join</button>
                                    </div>
                                </li>
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
