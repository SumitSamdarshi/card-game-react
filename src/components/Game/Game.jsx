import React, { useEffect, useState } from 'react';
import './Game.css'; // Include a CSS file for styling
import baseImage from "../../images/000.png";
import { getCurrentUser, updateUser } from '../../auth/auth';
import { apiService } from '../../service/user-service';
import { toast } from 'react-toastify';
import { GiChest } from 'react-icons/gi';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { FaPowerOff } from 'react-icons/fa';
import { playClickSound, useMusic } from '../Music/MusicProvider';
import { PiSpeakerHighFill, PiSpeakerSlashFill } from 'react-icons/pi';

const images = require.context('../../images', false, /\.(png|jpe?g|gif)$/);

const Game = () => {
    const navigate = useNavigate();
    const { isMusicPlaying, toggleMusic } = useMusic();
    const location = useLocation();
    const gameType = location.state;

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
    const [playerTurn, setPlayerTurn] = useState(true);
    const [computerCardImage, setComputerCardImage] = useState(baseImage);
    const [roundWinner, SetRoundWinner] = useState(null);
    const [roundOver, setRoundOver] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playerLostCard, setPlayerLostCard] = useState(null);

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

    const handleCompare = () => {
        if(isMusicPlaying){
            playClickSound();
        }
        setIsLoading(true);
        const stat = statSelected === 'select' ? null : statSelected;

        const compareReq = {
            "gameId": gameData.game_id,
            "playerCardId": selectedCard.cardId,
            "stat": stat
        }
        apiService.post('/card-game/api/games/compareCard', compareReq)
            .then((response) => {
                setTimeout(() => {
                    setIsLoading(false);
                }, 5);
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
                const compCards = computerCards;
                compCards.shift();
                const plaCards=playerCards.filter((card) => card.cardId !== selectedCard.cardId);

                if(data.game.game_type==='Random10'){
                    if(data?.roundWinner==='Computer'){
                        compCards.push(baseImage);
                    }else if(data?.roundWinner==='Player'){
                        plaCards.push(data.computerCard);
                    }
                }

                setPlayerCards(plaCards);
                setComputerCards(compCards);

                setGameData(data?.game);
                setComputerScore(data?.game?.computerScore);
                setPlayerScore(data?.game?.playerScore);
                setComputerStat(data?.stat);
                const compImageSrc = images(`./${data.computerCard.cardId.toString().padStart(3, '0')}.png`);
                setComputerCardImage(compImageSrc);
                SetRoundWinner(data?.roundWinner);
                setRoundOver(true);
                if (data?.game?.winner === 'Computer') {
                    setPlayerLostCard(data?.playerLostCard);
                }
                setTimeout(() => {
                    setWinner(data?.game?.winner);
                }, 2000);
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
        const createGame = () => {
            setIsLoading(true);

            const currentUser = getCurrentUser();
            const gameReq = {
                'game_type': gameType.type,
                'playerId': currentUser.user_id,
                'playerCards': gameType.data
            }
            apiService.post('/card-game/api/games/createGame', gameReq)
                .then((response) => {
                    setTimeout(() => {
                        setIsLoading(false);

                    }, 7);
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
                        setIsLoading(false);
                        navigate("/player/dashboard");
                        return;
                    }
                    const compCards = [];
                    var size=0;
                    if(data.game_type==='Random10'){
                        size=data.playerCards.length +(data?.computerScore-data?.playerScore)
                    }else{
                        size = data.playerCards.length;
                    }
                    for (let i = 0; i < size; i++) {
                        compCards.push(baseImage);
                    }
                    setComputerCards(compCards);
                    setGameData(data);
                    setPlayerCards(data.playerCards);
                    setComputerScore(data?.computerScore);
                    setPlayerScore(data?.playerScore);
                    setPlayerTurn(data.turn==='player');
                    if (data?.computerScore !== 0 || data?.playerScore !== 0) {
                        toast.success("Existing game loaded !", {
                            style: {
                                backgroundColor: "black",
                                color: "#ea9828",
                            }
                        })
                    }
                })
                .catch(() => {
                    toast.error("Something went wrong !!", {
                        style: {
                            backgroundColor: "black",
                            color: "#ea9828",
                        }
                    });
                });
        }

        createGame();
    }, [gameType, navigate]);

    const handleExit = () => {
        if(isMusicPlaying){
            playClickSound();
        }
        setIsLoading(true);
        apiService.get(`/card-game/api/users/${gameData.playerId}`)
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
        if (roundWinner === 'Player' && playerTurn) {
            setPlayerTurn(false);
        } else if (roundWinner === 'Computer' && !playerTurn) {
            setPlayerTurn(true);
        }
    }

    const handleQuit = () => {
        if(isMusicPlaying){
            playClickSound();
        }
        setIsLoading(true);
        apiService.get(`/card-game/api/games/quit/${gameData.game_id}`)
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
                setGameData(data?.game);
                setWinner(data?.game?.winner);
                setPlayerLostCard(data?.playerLostCard);
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

    const selectedCardImageSrc = selectedCard ? images(`./${selectedCard.cardId.toString().padStart(3, '0')}.png`) : null;
    const playerLostCardImageSrc = playerLostCard ? images(`./${playerLostCard.cardId.toString().padStart(3, '0')}.png`) : null;

    return (
        <>

            <div className="game-card-container">
                <div className="game-sound" onClick={toggleMusic} style={{ cursor: 'pointer' }}>
                    {isMusicPlaying ? (
                        <PiSpeakerHighFill />
                    ) : (
                        <PiSpeakerSlashFill />
                    )}
                </div>

                <div className="game-quit-button-container">
                    <FaPowerOff className="game-quit-icon" onClick={handleQuit} />
                    <div className="game-quit-info-div">You will lose one card !</div>
                </div>
                <ClipLoader size={50} color={"#3498db"} loading={isLoading} />
                <div className="game-name-tag-computer">Computer</div>
                <div className="game-card-sub-conainter">
                    <div className="game-computer-cards">
                        {computerCards.map((card, index) => (
                            <div className='game-computer-card-wrapper'>
                                <img key={index} src={card} alt={`Computer Card ${index + 1}`} className="game-card" />
                            </div>
                        ))}
                    </div>
                    <div className='game-turn'>{playerTurn ? "Player's" : "Computer's"} turn</div>
                    <div className="game-scores">
                        <div className="game-player-score">Player Score: {playerScore}</div>
                        <div className="game-computer-score">Computer Score: {computerScore}</div>
                    </div>
                    <div className='game-turn-text'>{showStats ? (playerTurn ? "Select a stat !!" : "Select a card !!") : "Select a card !!"} </div>

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
                    {showStats && playerTurn && (
                        <div className="game-stats">
                            <button onClick={() => handleOptionSelect('speed')}>{`Speed - ${selectedCard.speed}`}</button>
                            <button onClick={() => handleOptionSelect('combat')}>{`Combat - ${selectedCard.combat}`}</button>
                            <button onClick={() => handleOptionSelect('chakra')}>{`Chakra - ${selectedCard.chakra}`}</button>
                            <button onClick={() => handleOptionSelect('jutsu')}>{`Jutsu - ${selectedCard.jutsu}`}</button>
                            <button onClick={() => handleOptionSelect('intel')}>{`Intel - ${selectedCard.intel}`}</button>
                            <button onClick={() => handleOptionSelect('regen')}>{`regen - ${selectedCard.regen}`}</button>
                        </div>
                    )}
                    {showStats && !playerTurn && (
                        <div className="game-stats">
                            <button onClick={() => handleOptionSelect('select')}>Select</button>
                        </div>
                    )}
                </div>
                <div className="game-name-tag-player">{getCurrentUser().name}</div>

                {statSelected && (
                    <div className="game-modal-overlay">
                        <div className="game-modal-content" >
                            {roundOver && (<div className='game-winner-content'>
                                {roundWinner === 'Draw' ? (
                                    <p>Draw</p>
                                ) : roundWinner === 'Player' ? (
                                    <p>Player wins this round, next turn : computer</p>
                                ) : (<p>Computer wins this round, next turn : player</p>)}
                            </div>)}
                            <div className="game-cards-display">
                                <div className="game-card-wrapper">
                                    <div className='game-center-card-container'>
                                        <img src={selectedCardImageSrc} alt="Player's Card" className={`game-center-card ${roundOver && roundWinner !== 'Player' ? 'lost' : ''}`} />
                                    </div>
                                    <div className='game-center-card-text'>Player's Card</div>
                                </div>
                                <div className="game-card-wrapper">
                                    <div className='game-center-card-container'>
                                        <img src={computerCardImage} alt="Computer's Card" className="game-center-card" />
                                    </div>
                                    <div className='game-center-card-text'>Computer's Card</div>
                                </div>
                            </div>
                            {!roundOver && (<div>
                                <button className="game-button" onClick={handleCompare}>Compare</button>
                            </div>)}
                            {roundOver && (
                                <div className='game-stat-text'>
                                    {playerTurn ? (
                                        <p>Player picked : {statSelected}</p>
                                    ) : (
                                        <p>Computer picked : {computerStat}</p>
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
                                {winner === 'Draw' ? (<p>DRAW</p>) : winner === 'Player' ? (<p>Game Winner : PLAYER</p>) : (<p>Game Winner : COMPUTER</p>)}
                            </div>
                            <div className="game-winner-card-display">
                                <div className="game-winner-card-wrapper">
                                    {winner === 'Computer' && playerLostCard && (<div className='game-winner-card-computer'>
                                        <div className='computer-card-wrapper'>
                                            <img src={playerLostCardImageSrc} alt="Player's Card" className="game-winner-card" />
                                        </div>
                                        
                                        <div className='game-center-card-text'>You lost this card</div>
                                    </div>)}
                                    {winner === 'Player' && (<div className='game-winner-card-player'>
                                        <GiChest className="game-chest-icon" />
                                        <div className='game-center-card-text'>You got {gameData?.winChestNumber} card draw chest !! Avail at Inventory</div>
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
                        <ClipLoader size={50} color={"#3498db"} loading={isLoading} />
                    </div>
                )}
            </div>

        </>
    );
};

export default Game;
