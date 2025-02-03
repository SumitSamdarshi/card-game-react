import React, { useEffect, useState } from 'react';
import './PvP.css';
import baseImage from "../../images/000.png";
import { getCurrentUser, getPvp, updateUser } from '../../auth/auth';
import { apiService } from '../../service/user-service';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { playClickSound, useMusic } from '../Music/MusicProvider';
import { PiSpeakerHighFill, PiSpeakerSlashFill } from 'react-icons/pi';

const images = require.context('../../images', false, /\.(png|jpe?g|gif)$/);

const PvP = () => {
    const navigate = useNavigate();
    const { isMusicPlaying, toggleMusic } = useMusic();
    const location = useLocation();
    const pvp = location.state;

    const [playerCards, setPlayerCards] = useState([]);
    const [computerCards, setComputerCards] = useState([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [computerScore, setComputerScore] = useState(0);
    const [selectedCard, setSelectedCard] = useState(null);
    const [showStats, setShowStats] = useState(false);
    const [statSelected, setStatSelected] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [winner, setWinner] = useState(null);
    const [computerStat, setComputerStat] = useState(null);
    const [playerTurn, setPlayerTurn] = useState('p1');
    const [computerCardImage, setComputerCardImage] = useState(baseImage);
    const [roundWinner, setRoundWinner] = useState(null);
    const [roundOver, setRoundOver] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playerLostCard, setPlayerLostCard] = useState(null);
    const [otherplayerName, setOtherPlayerName] = useState(null);
    const [isPlayerJoined,setPlayerJoined]=useState('false');
    const currentPlayer = getPvp();
    const currentUser = getCurrentUser();

    console.log("Current Player : ", currentPlayer);

    const handleCardClick = (card) => {
        if(isMusicPlaying){
            playClickSound();
        }
        if (selectedCard == null) {
            setSelectedCard(card);
        } else {
            setSelectedCard(null);
        }
        setShowStats(!showStats);
    };

    const handleOptionSelect = (stat) => {
        setShowStats(false);
        setStatSelected(stat);
    };

    const callEnquiryApi = () => {
        return apiService.get(`/card-game/api/pvp/enquiry/${gameData.pvpGameId}/${currentPlayer.charAt(currentPlayer.length - 1)}`)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log("enquiry data for ", currentPlayer, data);
                return data;
            })
            .catch(() => {
                return;
            });
    };

    const handleEnquiry = () => {
        let attempts = 0;
        const maxAttempts = 20;

        const intervalId = setInterval(() => {
            attempts++;
            callEnquiryApi().then(data => {
                if (data.roundWinner !== null) {
                    setIsLoading(false);
                    const compCards = computerCards;
                    compCards.shift();
                    setPlayerCards(playerCards.filter((card) => card.cardId !== selectedCard.cardId));
                    setComputerCards(compCards);
                    setGameData(data);
                    if (currentPlayer === 'p1') {
                        setComputerScore(data?.playerTwoScore);
                        setPlayerScore(data?.playerOneScore);
                        setComputerStat(data?.stat);
                    } else {
                        setComputerScore(data?.playerOneScore);
                        setPlayerScore(data?.playerTwoScore);
                        setComputerStat(data.stat);
                    }
                    setRoundWinner(data.roundWinner);
                    setPlayerLostCard(data.rewardCard)
                    const compImageSrc = images(`./${data.otherPlayerCard.cardId.toString().padStart(3, '0')}.png`);
                    setComputerCardImage(compImageSrc)
                    setRoundOver(true);

                    setTimeout(() => {
                        setWinner(data.winner);
                    }, 3000);

                    clearInterval(intervalId);
                }
                if (attempts >= maxAttempts) {
                    console.log('Maximum number of attempts reached, stopping polling.');
                    toast.error("Opponent inactive !! try again", {
                        style: {
                            backgroundColor: "black",
                            color: "#ea9828",
                        }
                    });
                    setStatSelected(null);
                    setSelectedCard(null);
                    setIsLoading(false);
                    clearInterval(intervalId);
                }
            });
        }, 3000);
    };

    const handleSubmit = () => {
        if(isMusicPlaying){
            playClickSound();
        }
        setIsLoading(true);
        const stat = statSelected === 'select' ? null : statSelected;

        const submitReq = {
            "pvpGameId": gameData.pvpGameId,
            "playerId": currentUser.user_id,
            "cardId": selectedCard.cardId,
            "stat": stat
        }

        apiService.post('/card-game/api/pvp/submit', submitReq)
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
                handleEnquiry();
            })
            .catch(() => {
                toast.error("Something went wrong !!", {
                    style: {
                        backgroundColor: "black",
                        color: "#ea9828",
                    }
                });
            });
    };


    useEffect(() => {
        const createPvpGame = () => {
            setIsLoading(true);

            const gameReq = {
                'pvpGameSize': pvp.create,
                'playerOneId': getCurrentUser().user_id
            }
            apiService.post('/card-game/api/pvp/create', gameReq)
                .then((response) => {
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 7);
                    return response.json();
                })
                .then((data) => {
                    console.log("pvp game data : ", data);
                    if (data?.success === false) {
                        toast.error(data.message, {
                            style: {
                                backgroundColor: "black",
                                color: "#ea9828",
                            }
                        });
                        setIsLoading(false);
                        navigate("/player/dashboard");
                        return;
                    }
                    const compCards = [];
                    const size = data.playerOneCards.length;
                    for (let i = 0; i < size; i++) {
                        compCards.push(baseImage);
                    }
                    setComputerCards(compCards);
                    setGameData(data);
                    setPlayerCards(data.playerOneCards);
                    setComputerScore(data?.playerTwoScore);
                    setPlayerScore(data?.playerOneScore);
                    setPlayerTurn('p1');
                    setTimeout(() => {
                        loadOtherPlayer(data.pvpGameId);
                    }, 1000);
                    
                })
                .catch(() => {
                    console.log("error : ");
                    toast.error("Something went wrong !!", {
                        style: {
                            backgroundColor: "black",
                            color: "#ea9828",
                        }
                    });
                });
        }

        const joinPvpGame = () => {
            setIsLoading(true);

            const gameReq = {
                'pvpGameId': pvp.join,
                'playerTwoId': getCurrentUser().user_id
            }
            apiService.post('/card-game/api/pvp/join', gameReq)
                .then((response) => {
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 7);
                    return response.json();
                })
                .then((data) => {
                    console.log("pvp game data : ", data);
                    if (data?.success === false) {
                        toast.error(data.message, {
                            style: {
                                backgroundColor: "black",
                                color: "#ea9828",
                            }
                        });
                        setIsLoading(false);
                        navigate("/player/dashboard");
                        return;
                    }
                    const compCards = [];
                    const size = data.playerTwoCards.length;
                    for (let i = 0; i < size; i++) {
                        compCards.push(baseImage);
                    }
                    setComputerCards(compCards);
                    setGameData(data);
                    setPlayerCards(data.playerTwoCards);
                    setComputerScore(data?.playerOneScore);
                    setPlayerScore(data?.playerTwoScore);
                    setOtherPlayerName(data.playerOneName);
                    setPlayerTurn('p1');
                    setPlayerJoined(false);
                })
                .catch(() => {
                    console.log("error : ");
                    toast.error("Something went wrong !!", {
                        style: {
                            backgroundColor: "black",
                            color: "#ea9828",
                        }
                    });
                });
        }

        const loadOtherPlayer = (gameId) =>{
            setIsLoading(true);
            setPlayerJoined(true);
            let attempts = 0;
            const maxAttempts = 20;
            const intervalId = setInterval(() => {
                attempts++;
                callApi(gameId).then(data => {
                    if (data.playerTwoName !== null) {
                        toast.success("Player Joined !", {
                            style: {
                                backgroundColor: "black",
                                color: "#ea9828",
                            }
                        })
                        setPlayerJoined(false);
                        setIsLoading(false);
                        setOtherPlayerName(data.playerTwoName);
                        clearInterval(intervalId);
                    }
                    if (attempts >= maxAttempts) {
                        toast.error("Player did not join ! Create new game ", {
                            style: {
                                backgroundColor: "black",
                                color: "#ea9828",
                            }
                        });
                        clearInterval(intervalId);
                        navigate("/player/dashboard");
                    }
                });
            }, 5000);
        }

        const callApi = (gameId) => {
            return apiService.get(`/card-game/api/pvp/enquiry/${gameId}/${getPvp().charAt(getPvp().length - 1)}`)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    return data;
                })
                .catch(() => {
                    return;
                });
        };

        if (getPvp() === 'p1') {
            createPvpGame();
        } else {
            joinPvpGame();
        }
    }, [navigate, pvp]);

    const handleExit = () => {
        if(isMusicPlaying){
            playClickSound();
        }
        setIsLoading(true);
        apiService.get(`/card-game/api/users/${currentUser.user_id}`)
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
                updateUser(data);
            })
            .catch(() => {
                toast.error("Something went wrong !!", {
                    style: {
                        backgroundColor: "black",
                        color: "#ea9828",
                    }
                });
            });
        navigate("/player/dashboard");
        setIsLoading(false);
    }

    const handleCompareExit = () => {
        setStatSelected(null);
        setSelectedCard(null);
        setRoundOver(false);
        setComputerCardImage(baseImage);
        if (roundWinner === 'p1') {
            setPlayerTurn('p2');
        } else if (roundWinner === 'p2' && playerTurn === 'p2') {
            setPlayerTurn('p1');
        }
    }

    const selectedCardImageSrc = selectedCard ? images(`./${selectedCard.cardId.toString().padStart(3, '0')}.png`) : null;
    const playerLostCardImageSrc = playerLostCard ? images(`./${playerLostCard.cardId.toString().padStart(3, '0')}.png`) : null;

    return (
        <>

            <div className="game-card-container">
            <div className='pvp-game-id'>(Game Id : {gameData?.pvpGameId})</div>
            <div className="game-sound" onClick={toggleMusic} style={{ cursor: 'pointer' }}>
                    {isMusicPlaying ? (
                        <PiSpeakerHighFill />
                    ) : (
                        <PiSpeakerSlashFill />
                    )}
                </div>
                <div className="game-name-tag-computer">{otherplayerName == null ? 'Opponent' : otherplayerName.toUpperCase()}</div>
                <div className="game-card-sub-conainter">
                    <div className="game-computer-cards">
                        {computerCards.map((card, index) => (
                            <div className='game-computer-card-wrapper'>
                                <img key={index} src={card} alt={`Computer Card ${index + 1}`} className="game-card" />
                            </div>
                        ))}
                    </div>
                    <div className='game-turn'>{((playerTurn === 'p1' && currentPlayer === 'p1') || (playerTurn === 'p2' && currentPlayer === 'p2')) ? `${currentUser.name}'s` : `${otherplayerName}'s`} turn</div>
                    <div className="game-scores">
                        <div className="game-player-score">{currentUser.name}'s Score: {playerScore}</div>
                        <div className="game-computer-score">{otherplayerName}'s Score: {computerScore}</div>
                    </div>
                    <div className='game-turn-text'>{showStats ? (((playerTurn === 'p1' && currentPlayer === 'p1') || (playerTurn === 'p2' && currentPlayer === 'p2')) ? "Select a stat !!" : "Select a card !!") : "Select a card !!"} </div>

                    <div className="game-player-cards">

                        {playerCards.map((card) => {
                            const imageSrc = images(`./${card.cardId.toString().padStart(3, '0')}.png`);

                            return (
                                <div key={card.cardId} className={`game-player-card-wrapper ${selectedCard?.cardId === card.cardId ? 'selected' : ''}`} onClick={() => handleCardClick(card)}>
                                    <img src={imageSrc} alt={card.name} className="game-card" />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className='game-stat-container'>
                    {showStats && ((playerTurn === 'p1' && currentPlayer === 'p1') || (playerTurn === 'p2' && currentPlayer === 'p2')) && (
                        <div className="game-stats">
                            <button onClick={() => handleOptionSelect('speed')}>{`Speed - ${selectedCard.speed}`}</button>
                            <button onClick={() => handleOptionSelect('combat')}>{`Combat - ${selectedCard.combat}`}</button>
                            <button onClick={() => handleOptionSelect('chakra')}>{`Chakra - ${selectedCard.chakra}`}</button>
                            <button onClick={() => handleOptionSelect('jutsu')}>{`Jutsu - ${selectedCard.jutsu}`}</button>
                            <button onClick={() => handleOptionSelect('intel')}>{`Intel - ${selectedCard.intel}`}</button>
                            <button onClick={() => handleOptionSelect('regen')}>{`regen - ${selectedCard.regen}`}</button>
                        </div>
                    )}
                    {showStats && !((playerTurn === 'p1' && currentPlayer === 'p1') || (playerTurn === 'p2' && currentPlayer === 'p2')) && (
                        <div className="game-stats">
                            <button onClick={() => handleOptionSelect('select')}>Select</button>
                        </div>
                    )}
                </div>
                <div className="game-name-tag-player">{getCurrentUser().name.toUpperCase()}</div>

                {statSelected && (
                    <div className="game-modal-overlay">
                        <div className="game-modal-content" >
                            {roundOver && (<div className='game-winner-content'>
                                {roundWinner === 'draw' ? (
                                    <p>Draw</p>
                                ) : roundWinner === 'p1' ? currentPlayer === 'p1' ? (
                                    <p>{currentUser.name} wins this round, next turn : {otherplayerName}</p>
                                ) : (
                                    <p>{otherplayerName} wins this round, next turn : {currentUser.name}</p>
                                ) : currentPlayer === 'p1' ? (<p>{otherplayerName} wins this round, next turn : {currentUser.name}</p>) : (<p>{currentUser.name} wins this round, next turn : {otherplayerName}</p>)}
                            </div>)}
                            <div className="game-cards-display">
                                <div className="game-card-wrapper">
                                    <div className='game-center-card-container'>
                                        <img src={selectedCardImageSrc} alt="Player's Card" className={`game-center-card ${roundOver && roundWinner !== 'Player' ? 'lost' : ''}`} />
                                    </div>
                                    <div className='game-center-card-text'>{getCurrentUser().name}'s card</div>
                                </div>
                                <div className="game-card-wrapper">
                                    <div className='game-center-card-container'>
                                        <img src={computerCardImage} alt="Computer's Card" className="game-center-card" />
                                    </div>
                                    <div className='game-center-card-text'>{otherplayerName == null ? 'Player' : otherplayerName}'s card</div>
                                </div>
                            </div>
                            {!roundOver && (<div>
                                <button className="game-button" onClick={handleSubmit}>Compare</button>
                            </div>)}
                            {roundOver && (
                                <div className='game-stat-text'>
                                    {((playerTurn === 'p1' && currentPlayer === 'p1') || (playerTurn === 'p2' && currentPlayer === 'p2')) ? (
                                        <p>{currentUser.name} picked : {statSelected}</p>
                                    ) : (
                                        <p>{otherplayerName} picked : {computerStat}</p>
                                    )}
                                </div>
                            )}
                            <div>
                                <button className={`game-exit-compare-button ${!roundOver ? 'before-compare' : ''}`} onClick={handleCompareExit}>Exit</button>
                            </div>
                        </div>
                    </div>
                )}

                {winner && (
                    <div className="game-modal-overlay">
                        <div className="game-modal-content">
                            <div className='game-winner-content'>
                                {winner === 'draw' ? (
                                    <p>Draw</p>
                                ) : ((winner === 'p1' && currentPlayer === 'p1') || (winner === 'p2' && currentPlayer === 'p2')) ? 
                                (<p>Game Winner : {currentUser.name}</p>) : (<p>Game Winner : {otherplayerName}</p>)}
                            </div>
                            <div className="game-winner-card-display">
                                <div className="game-winner-card-wrapper">
                                    {winner !== 'draw' && playerLostCard && (<div className='game-winner-card-computer'>
                                        <img src={playerLostCardImageSrc} alt="Player's Card" className="game-winner-card" />
                                        <div className='game-center-card-text'>{winner === 'p1' ? currentPlayer === 'p1' ? (
                                            <p>You win this card</p>
                                        ) : (
                                            <p>You lose this card</p>
                                        ) : currentPlayer === 'p1' ? (<p>You lose this card</p>) : (<p>You win this card</p>)}</div>
                                    </div>)}
                                </div>
                            </div>
                            <div>
                                <button className="game-button" onClick={handleExit}>Exit</button>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="game-modal-overlay">
                        {isPlayerJoined && (<div className='pvp-player-waiting'>Waiting for other player to Join</div>)}
                        <ClipLoader size={50} color={"#3498db"} loading={isLoading} />
                    </div>
                )}
            </div>

        </>
    );
};

export default PvP;
