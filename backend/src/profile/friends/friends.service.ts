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
        relations: ['friends', 'friend_requests', 'blocked_users'],
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getFriendFriends(login: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { login },
        relations: ['friends', 'blocked_users'],
      });
      console.log(user);
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  async blockUser(user_id: number, friend_id: number) {
    try {
      await this.removeFriend(user_id, friend_id);
      const user = await this.userRepo.findOne({ where: { id: user_id }, relations: ['blocked_users'] });
      user.blocked_users.forEach((friend) => {
        if (friend.id === friend_id) {
          throw new Error('is already blocked');
        }
      });
      const friend = await this.userRepo.findOne({ where: { id: friend_id } });
      user.blocked_users.push(friend);
      user.save();
    } catch (error) {
      throw error;
    }
  }

  async unblockUser(user_id: number, blocked_id: number) {
    try {
      const user = await this.userRepo.findOne({ where: { id: user_id }, relations: ['blocked_users'] });
      user.blocked_users = user.blocked_users.filter((user) => user.id !== blocked_id);
      user.save();
    } catch (error) {
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
        where: { id: friend_id },
        relations: ['friend_requests'],
      });
      user.friend_requests.forEach((friend) => {
        if (friend.id === friend_id) {
          throw new Error('friend request already sent');
        }
      });
      const friendUser = await this.userRepo.findOne({
        where: { id: user_id },
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
      await this.adding_friend(user_id, friend_id);
      await this.adding_friend(friend_id, user_id);

    } catch (error) {
      throw error;
    }
  }

  async adding_friend(user_id:number, friend_id: number) {
    try {
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
    } catch (err) {
      throw err;
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
      await this.removingFriend(user_id, friend_id);
      await this.removingFriend(friend_id, user_id);
    } catch (err) {
      throw err;
    }
  }

  async removingFriend(user_id: number, friend_id: number) {
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

  async searchUsers(login: string) {
    try {
      const users = await this.userRepo.find({
        where: { login: Like(`%${login}%`) },
        relations: ['blocked_users'],
      });
      return users;
    } catch (err) {
      throw err;
    }
  }
}
