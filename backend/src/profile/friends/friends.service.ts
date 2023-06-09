import { Injectable } from '@nestjs/common';
import { User } from 'src/typeorm';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { log } from 'console';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  /**
   * @param login string
   * @returns arrray of Friend instances
   */
  async getFriends(login: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { login },
        relations: ['friends', 'friend_requests'],
      });
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * @param user_id number of logged in user
   * @param friend login of request recipient
   *
   * @returns void or throws error
   */
  async addFriendRequest(user_id: number, friend_id: number) {
    try {
      if (user_id == friend_id) throw new Error('cannot same user as friends');
      const user = await this.userRepo.findOne({
        where: { id: user_id },
        relations: ['friend_requests'],
      });
      user.friend_requests.forEach((friend) => {
        if (friend.id === friend_id) {
          throw new Error('friend request already sent');
        }
      });
      const friendUser = await this.userRepo.findOne({
        where: { id: friend_id },
      });
      user.friend_requests.push(friendUser);
      user.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * accept friend request
   *
   * @param user_id user which accepts request
   * @param friend_id user which sent request
   * @returns void or throws error
   */
  async acceptFriendRequest(user_id: number, friend_id: number) {
    try {
      if (user_id == friend_id) throw new Error('cannot same user as friends');
      const user = await this.userRepo.findOne({
        where: { id: user_id },
        relations: ['friend_requests', 'friends'],
      });
      const friendUser = await this.userRepo.findOne({
        where: { id: friend_id },
      });
      user.friend_requests = user.friend_requests.filter(
        (friend) => friend.id !== friend_id,
      );
      user.friends.push(friendUser);
      user.save();
    } catch (error) {
      throw error;
    }
  }

  async declineFriendRequest(user_id: number, friend_id: number) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: user_id },
        relations: ['friend_requests'],
      });
      user.friend_requests = user.friend_requests.filter(
        (friend) => friend.id !== friend_id,
      );
      user.save();
    } catch (err) {
      throw err;
    }
  }

  async removeFriend(user_id: number, friend_id: number) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: user_id },
        relations: ['friends'],
      });
      user.friends = user.friends.filter((friend) => friend.id !== friend_id);
      user.save();
    } catch (err) {
      throw err;
    }
  }

  async searchUsers(login: string){
    try{
      console.log(login);
      const users = await this.userRepo.find({
        where : { login : Like(`%${login}%`)},
      });
      return users;
    }catch (err) {
      throw err;
    }
  }
}
