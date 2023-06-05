import { atom, selector } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const localStorage =
  typeof window !== 'undefined' ? window.localStorage : undefined;

const { persistAtom } = recoilPersist({
  key: 'userSession',
  storage: localStorage,
});

interface IUserData {
  nickname: string;
  username: string;
  email: string;
  accessToken: string;
}

export const userState = atom<IUserData>({
  key: 'AuserState',
  default: {
    nickname: '',
    username: '',
    email: '',
    accessToken: '',
  },
  effects_UNSTABLE: [persistAtom],
});

export const getAccessToken = selector({
  key: 'AaccessToken',
  get: ({ get }) => {
    const copy = get(userState);
    return copy.accessToken;
  },
});
