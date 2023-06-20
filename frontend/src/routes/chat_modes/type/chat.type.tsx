import { Player } from "../../game.interfaces";

export type oneSuggestion = {
  catagory: string;
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
  targetId: number;
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
  channelId: number | undefined;
  dm: boolean;
  login: string | null;
  password: string;
  targetId: number | string;
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
  //   channelId: number;
  email: string;
  username: string;
  msg: string;
  createAt: string;
  //   updateAt: string;
  //   isInvite: boolean;
};

export type oneUser = {
  username: string;
  id: number;
  email: string;
  isOwner: boolean;
  isAdmin: boolean;
  isInvited: boolean;
  isMuted: boolean;
  isFriend: boolean;
  isOnline: boolean;
  isBlocked: boolean;
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
  login: string;
  channelId: number;
};

export type gameInvitation = {
  gameInfo: Player;
  inviterId: number;
  inviterName: string;
  targetId: number;
};
