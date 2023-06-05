import axios from 'axios';

export const loginAPI = (code: string) =>
  axios.get('/login/oauth2/code/google', {
    params: { code: code },
  });

export const logoutAPI = (token: string) =>
  axios.get('/oauth2/sign-out', {
    headers: {
      Authorization: token,
    },
  });

export const withdrawAPI = (token: string) =>
  axios.delete('/oauth2/withdraw', {
    headers: {
      Authorization: token,
    },
  });
