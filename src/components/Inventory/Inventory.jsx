import React, { useState, useEffect } from "react";
import "./Inventory.css";
import { BASE_URL, apiService } from "../../service/user-service";
import { getCurrentUser, getToken, updateUser } from "../../auth/auth";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { GiChest, GiUpgrade } from "react-icons/gi";
import { toast } from "react-toastify";
import { TiEdit } from "react-icons/ti";
import { ClipLoader } from "react-spinners";

const images = require.context('../../images', false, /\.(png|jpe?g|gif)$/);

const Inventory = () => {
  const navigate = useNavigate();
  const userData = getCurrentUser();

  const [categories, setCategories] = useState(["All", "Common", "Rare", "Epic", "Mythic", "Legendary"]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [activeSection, setActiveSection] = useState("All");
  const [cards, setCards] = useState([]);
  const [newCard, setNewCard] = useState(false);
  const [toggle, setToggle] = useState(false);  // just to refreash page 
  const [noOfCardsCombine, setNoOfCardsCombine] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const blurBg = activeCard != null ? { opacity: '25%' } : {};

  const handleBarButtonClicked = (section) => {
    setActiveSection(section);
    if (isSelecting) {
      if (section === 'Common') {
        setNoOfCardsCombine(3);
      } else if (section === 'Rare') {
        setNoOfCardsCombine(4);
      } else if (section === 'Epic') {
        setNoOfCardsCombine(5);
      } else if (section === 'Mythic') {
        setNoOfCardsCombine(6);
      }
    }
  }

  const handleCardClick = (card, index) => {
    if (isSelecting) {
      const selectedCardsKey = card.cardId + '-' + index;
      if (selectedCards.includes(selectedCardsKey)) {
        setSelectedCards(selectedCards.filter((c) => c !== selectedCardsKey));
      } else if (selectedCards.length < noOfCardsCombine) {
        setSelectedCards([...selectedCards, selectedCardsKey]);
      }
    } else {
      setActiveCard(card);
    }
  };

  const closeModal = () => {
    setNewCard(false);
    setActiveCard(null);
  };

  const toggleSelectionMode = () => {
    if (!isSelecting) {
      setActiveSection('Common');
      setNoOfCardsCombine(3);
      setCategories(categories.slice(0, -1));
    } else {
      setCategories([...categories, 'Legendary']);
    }
    setIsSelecting(!isSelecting);

    setSelectedCards([]);
  };

  const handleCombine = () => {
    setIsLoading(true);

    const newCards = selectedCards.map(card => card.split('-')[0]);
    const combineCardReq = {
      'userId': getCurrentUser().user_id,
      'type': activeSection,
      'cards': newCards
    }

    apiService
      .post('/card-game/api/cards/combine', combineCardReq)
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
        setActiveCard(data.card)
        setNewCard(true);
        updateUser(data.user);
        setActiveSection('All');
      })
      .catch(() => {
        setActiveSection('All');
        toast.error("Something went wrong !!", {
          style: {
            backgroundColor: "black",
            color: "#ea9828",
          }
        });
      });

    setIsSelecting(false);
    setCategories([...categories, 'Legendary']);
    setSelectedCards([]);
    setIsLoading(false);
  };

  const handleDraw = () => {
    setIsLoading(true);
    apiService.post('/card-game/api/cards/draw', userData)
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
        setActiveCard(data.card);
        setNewCard(true);
        updateUser(data.user);
        setActiveSection('All');
        setToggle(!toggle);
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

  const fetchCards = (section) => {
    setIsLoading(true);
    const currentUser = getCurrentUser();
    const getCardUrl = '/card-game/api/cards/user/' + currentUser.user_id + (section !== "All" ? '/' + section.toLowerCase() : '');

    apiService
      .get(getCardUrl)
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
        setCards(data);
        setSelectedCards([]);
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

  const handleBackClick = () => {
    navigate('/player/dashboard');
  };

  useEffect(() => {
    fetchCards(activeSection);
  }, [activeSection, toggle]);

  const handleEditClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("userImage", file);
        try {
          const response = await fetch(`${BASE_URL}/card-game/api/users/image/upload/${userData.user_id}`, {
            method: "POST",
            body: formData,
            headers: {
              "Authorization": `Bearer ${getToken()}`,
            },
          });
          if (response.ok) {
            const newImageUrl = await response.json();
            updateUser(newImageUrl);
            setToggle(!toggle);
          } else {
            toast.error("Something went wrong !!", {
              style: {
                backgroundColor: "black",
                color: "#ea9828",
              }
            });
          }
        } catch (error) {
          toast.error("Something went wrong !!", {
            style: {
              backgroundColor: "black",
              color: "#ea9828",
            }
          });
        }
      }
    };
    input.click();
  };

  const activeImageSrc = activeCard ? images(`./${activeCard.cardId.toString().padStart(3, '0')}.png`) : null;

  return (
    <div className="inventory-container">
      <IoMdArrowRoundBack onClick={handleBackClick} className="inventory-back-icon" />
      {!isSelecting && (
        <div className="inventory-profile-container" style={blurBg}>
          <div className="inventory-profile-card">
            <div className="inventory-card-left">
              <div className="inventory-profile-image-container">
                <div
                  className="inventory-profile-image"
                  style={{
                    backgroundImage: `url(${BASE_URL}/card-game/api/users/image/${userData.profileImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "top",
                  }}
                />
                <TiEdit className="inventory-edit-icon" onClick={handleEditClick} />
              </div>
              <p className="inventory-about-user">{userData.about}</p>
            </div>
            <div className="inventory-card-right">
              <div className="inventory-user-info">
                <div className="inventory-info-item">
                  <span className="inventory-info-label">Email:</span>
                  <span className="inventory-info-value">{userData.email}</span>
                </div>
                <div className="inventory-info-item">
                  <span className="inventory-info-label">Name:</span>
                  <span className="inventory-info-value">{userData.name}</span>
                </div>
                <div className="inventory-info-item">
                  <span className="inventory-info-label">Matches:</span>
                  <span className="inventory-info-value">{userData.matches}</span>
                </div>
                <div className="inventory-info-item">
                  <span className="inventory-info-label">Wins:</span>
                  <span className="inventory-info-value">{userData.wins}</span>
                </div>
                <div className="inventory-info-item">
                  <span className="inventory-info-label">Streak:</span>
                  <span className="inventory-info-value">{userData.winStreak}</span>
                </div>
                <div className="inventory-info-item">
                  <span className="inventory-info-label">Losses:</span>
                  <span className="inventory-info-value">{userData.losses}</span>
                </div>
                <div className="inventory-info-item">
                  <span className="inventory-info-label">Draws:</span>
                  <span className="inventory-info-value">{userData.draws}</span>
                </div>
                <div className="inventory-info-item">
                  <span className="inventory-info-label">Cards:</span>
                  <span className="inventory-info-value">{userData.noOfCards}</span>
                </div>
                <div className="inventory-info-item">
                  <span className="inventory-info-label">Chest:</span>
                  <span className="inventory-info-value">{userData.chest}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="inventory-chest-container">
            <GiChest className="inventory-chest-icon" onClick={handleDraw} />
            <div className="inventory-chest-label">Chest</div>
            <div className="inventory-chest-number">{userData.chest}</div>
            <div className="inventory-info-div">
              <h3>Draw your card !!</h3>
              <div className="inventory-draw-chances">
                <li>Common : 80%</li>
                <li>Rare : 12%</li>
                <li>Epic : 5%</li>
                <li>Mythic : 2.2%</li>
                <li>Legendary : 0.8%</li>

              </div>
            </div>
          </div>

          <div className="inventory-combine-container">
            <GiUpgrade className="inventory-combine-icon" onClick={toggleSelectionMode} />
            <div className="inventory-combine-label">Upgrade</div>
            <div className="inventory-info-div">Combine same type of cards to get upgraded card</div>
          </div>

        </div>

      )}

      {isSelecting && (<div className="inventory-note-container">
        <div className="inventory-note-card">
          <span className="inventory-note-text">{selectedCards.length}/{noOfCardsCombine} : Cards Selected</span>
        </div>
        <button className="inventory-rounded-button" onClick={handleCombine} disabled={selectedCards.length < noOfCardsCombine}>Combine</button>
        <button className="inventory-rounded-button cancel" onClick={toggleSelectionMode}>Cancel</button>
      </div>
      )}

      <div>
        <div className="inventory-bar-container" style={blurBg}>
          {categories.map((section) => (
            <div
              key={section}
              className={`inventory-bar-section ${activeSection === section ? "active" : ""} ${isSelecting && section === "All" ? "disabled" : ""}`}
              onClick={() => handleBarButtonClicked(section)}
            >
              {section.toUpperCase()}
            </div>
          ))}
        </div>

        <div className="inventory-cards-container" style={blurBg}>
          {cards.map((card, index) => {
            const imageSrc = images(`./${card.cardId.toString().padStart(3, '0')}.png`);

            return (
              <div key={card.cardId} className={`inventory-card ${selectedCards.includes((card.cardId + '-' + index)) ? "selected" : ""}`} onClick={() => handleCardClick(card, index)}>
                <img src={imageSrc} alt={card.name} className="inventory-card-image" />
              </div>
            );
          })}
        </div>
      </div>

      {activeCard && (
        <div className="inventory-modal-overlay" onClick={closeModal}>
          {newCard && (<div className="inventory-modal-overlay-text">You got this card !!</div>)}
          <div className="inventory-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="inventory-modal-card-content">
              <img src={activeImageSrc} alt={activeCard.name} className="inventory-card-image" />
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="inventory-modal-overlay">
          <ClipLoader size={50} color={"#3498db"} loading={isLoading} />
        </div>
      )}
    </div>
  );
};

export default Inventory;
