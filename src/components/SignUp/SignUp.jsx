import React, { useState } from 'react';
import './SignUp.css';
import { apiService } from '../../service/user-service';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { ClipLoader } from 'react-spinners';


const SignUp = () => {
  const navigate = useNavigate();
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
    e.preventDefault();
    setIsLoading(true);

    apiService
      .post('/card-game/api/auth/register', formData)
      .then((response) => {
        return response.json(); // Directly parse as JSON
      })
      .then((data) => {
        if (data?.success === false) {
          toast.error(data.message);
        }
        if (data == null || data.user_id == null) {
          return;
        }
        toast.success("Registration Successful !");
        setIsLoading(false);
        navigate("/login")
      })
      .catch((error) => {
        console.error('Error during registration:', error);
      });
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="signup-container">
      <IoMdArrowRoundBack onClick={handleBackClick} className="signup-back-icon" />
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
