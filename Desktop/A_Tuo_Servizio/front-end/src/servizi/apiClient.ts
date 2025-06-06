import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // TODO: Configurare l'URL base corretto per le API backend
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

export default apiClient;
