import React, { useEffect, useState } from 'react';
import './Login.css';
import { apiService } from '../../service/user-service';
import { toast } from "react-toastify";
import { doLogin, isLoggedIn } from '../../auth/auth';
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from 'react-icons/io';
import { ClipLoader } from 'react-spinners';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/player/dashboard');
    }
  }, [navigate]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleRegisterNavigation = () => {
    navigate("/signUP");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    apiService
      .post('/card-game/api/auth/login', credentials)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data?.success === false) {
          toast.error(data.message);
        }
        if (data == null || data.token == null || data.user == null) {
          return;
        }
        doLogin(data, () => {
        })
        toast.success("Login Successful !")
        setIsLoading(false);
        navigate("/player/dashboard")
      })
      .catch((error) => {
        console.error('Error during registration:', error);
      });

  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <IoMdArrowRoundBack onClick={handleBackClick} className="login-back-icon" />
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="login-form-group">
          <label htmlFor="username">Username</label>
          <input
            type="email"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            autoComplete="off"
          />
        </div>
        <div className="login-form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="login-register-link-container">
          <span>Not a player? </span>
          <span
            className="login-register-link"
            onClick={handleRegisterNavigation}
          >
            Register
          </span>
        </div>
        <button type="submit" className="login-submit-button">Login</button>
      </form>

      {isLoading && (
        <div className="game-modal-overlay">
          <ClipLoader size={50} color={"#3498db"} loading={isLoading} />
        </div>
      )}
    </div>
  );
};

export default Login;