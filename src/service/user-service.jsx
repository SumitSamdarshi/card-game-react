import { getToken } from "../auth/auth";

 export const BASE_URL = 'https://card-game-production.up.railway.app';
//export const BASE_URL = 'http://localhost:9090';

export const apiService = {

  post: (endpoint, data) => {
    const token = getToken();
    return fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error('API POST Error:', error);
        throw error;
      });
  },

  get: (endpoint) => {
    const token = getToken();
    return fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error('API GET Error:', error);
        throw error;
      });
  }

};
