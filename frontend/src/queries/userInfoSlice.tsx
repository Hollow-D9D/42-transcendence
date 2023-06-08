import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';
import {  createStore,  applyMiddleware } from 'redux';
import thunk, { ThunkAction } from 'redux-thunk';

interface UserInfoState {
  id: string;
  userToken: string;
  userName: string;
  userNickname: string;
  userEmail: string;
  userGamesWon: number;
  userGamesLost: number;
  userGamesPlayed: number;
  userAuth: boolean;
  userAvatar: string;
}

const initialState: UserInfoState = {
  id: '',
  userToken: '',
  userName: '',
  userNickname: '',
  userEmail: '',
  userGamesWon: 0,
  userGamesLost: 0,
  userGamesPlayed: 0,
  userAuth: false,
  userAvatar: '',
};

const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfoState>) => {
      return action.payload;
    },
    storeUserAvatar: (state, action: PayloadAction<UserInfoState>) => {
      state.userAvatar = action.payload.userAvatar;
    },
  },
});

const store = configureStore({
  reducer: {
    userInfo: userInfoSlice.reducer,
  },
});

export const { setUserInfo, storeUserAvatar } = userInfoSlice.actions;

// Create the store manually with Redux createStore function
// export const store = createStore(userInfoSlice.reducer, applyMiddleware(thunk));

// export const { setUserInfo } = userInfoSlice.actions;
export type RootState = ReturnType<typeof store.getState>;
export default store;