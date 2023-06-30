import { Player } from "../../game.interfaces";

export type oneSuggestion = {
  category: string;
  picture: string;
  name: string;
  id: number;
  data_id: number;
};

export type chatPreview = {
  id: number;
  dm: boolean;
  name: string;
  isPassword: boolean;
  password: string;
  updateAt: string;
  lastMsg: string;
  unreadCount?: number;
  ownerEmail: string;
  ownerId: number;
  isBlocked: boolean;
  avatar: string;
};

export type newChannel = {
  name: string;
  private: boolean;
  password: string;
  login: string | null;
  mode: string;
};

export type newDM = {
  email: string | null;
  target_login: string;
};

export type fetchDM = {
  channelId: number;
  targetId: number;
};

export type Tag = {
  id: number | string;
  name: string;
};

export type updateChannel = {
  chat_id: number | undefined;
  dm: boolean;
  login: string | null;
  password: string;
  target: number | string;
  private: boolean;
  isPassword: boolean;
  newPassword: string;
};

export type useMsg = {
  token: string | null;
  chatId: number;
  message: string;
};

export type oneMsg = {
  msgId: number;
  id: number;
  email: string;
  username: string;
  msg: string;
  createAt: string;
};

export type oneUser = {
  nickname: string;
  id: number;
  login: string;
  role: string;
  isMuted: boolean;
  isFriend: boolean;
  status: number;
  isBlocked: boolean;
  profpic_url: string;
};

export type updateUser = {
  selfEmail: string | null;
  otherId: number;
};

export type setting = {
  private: boolean;
  isPassword: boolean;
};

export type mute = {
  duration: number;
  login: string | null;
  target: string;
  channelId: number;
};

export type gameInvitation = {
  gameInfo: Player;
  inviterId: number;
  inviterName: string;
  targetId: number;
  avatar: string;
  inviterLogin: string;
};
