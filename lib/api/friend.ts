import axios from 'axios';

interface AddFriendBody {
  email: string;
  token: string;
}

export const addFriendAPI = (email: string, token: string) =>
  axios.post('/follow', null, {
    headers: {
      Authorization: token,
    },
    params: {
      email: email,
    },
  });

export const getFriendAPI = (token: string) =>
  axios.get('/follow/following', {
    headers: {
      Authorization: token,
    },
  });

export const addFriendAPIByNext = (body: AddFriendBody) =>
  axios.post('https://capstone-web-zeta.vercel.app/api/friend/addFriend', body);
