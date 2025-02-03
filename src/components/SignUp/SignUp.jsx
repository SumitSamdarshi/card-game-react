import React, { useState } from 'react';
import './SignUp.css';
import { apiService } from '../../service/user-service';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { ClipLoader } from 'react-spinners';
import { PiSpeakerHighFill, PiSpeakerSlashFill } from 'react-icons/pi';
import { playClickSound, useMusic } from '../Music/MusicProvider';


const SignUp = () => {
  const navigate = useNavigate();
  const { isMusicPlaying, toggleMusic } = useMusic();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    about: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    if (isMusicPlaying) {
      playClickSound();
    }
    e.preventDefault();
    setIsLoading(true);

    apiService
      .post('/card-game/api/auth/register', formData)
      .then((response) => {
        return response.json(); // Directly parse as JSON
      })
      .then((data) => {
        if (data?.success === false) {
          toast.error(data.message, {
            style: {
              backgroundColor: "black",
              color: "#ea9828",
            }
          });
        }
        if (data == null || data.user_id == null) {
          return;
        }
        toast.success("Registration Successful!", {
          style: {
            backgroundColor: "black",
            color: "#ea9828",
          }
        });
        setIsLoading(false);
        navigate("/login")
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
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="signup-container">
      <div className="sound-back" onClick={toggleMusic} style={{ cursor: 'pointer' }}>
      <IoMdArrowRoundBack onClick={handleBackClick} className="login-back-icon" />
        {isMusicPlaying ? (
          <PiSpeakerHighFill className="sound-icon"/>
        ) : (
          <PiSpeakerSlashFill className="sound-icon"/>
        )}
      </div>
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <div className="signup-form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
            autoComplete='off'
          />
        </div>
        <div className="signup-form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="signup-form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="signup-form-group">
          <label htmlFor="about">About</label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            required
          ></textarea>
        </div>
        <button type="submit" className="signup-submit-button">Submit</button>
      </form>
      {isLoading && (
        <div className="game-modal-overlay">
          <ClipLoader size={50} color={"#3498db"} loading={isLoading} />
        </div>
      )}
    </div>
  );
};

export default SignUp;
