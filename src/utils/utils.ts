import mongoose from 'mongoose'

export interface UserInfo {
  username: string;
  avatar: string;
  phoneNumber: string;
  password?: string;
  _id: mongoose.Schema.Types.ObjectId;
}

/**
 * @description: 去除敏感信息的用户信息
 * @param {UserInfo} data
 * @return {UserInfo}
 */
export function formatUserInfo(data): UserInfo {
  return {
    username: data.username,
    avatar: data.avatar,
    phoneNumber: data.phoneNumber,
    _id: data._id,
  }
}