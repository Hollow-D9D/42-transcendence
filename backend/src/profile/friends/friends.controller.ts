import { Controller, Get, UseGuards, Headers, Query } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { getPayload } from 'src/auth/utils';

@Controller('profile/friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  /**
   * @param headers user_id from token payload
   *
   * @returns { error, body }
   */
  @Get()
  @UseGuards(AuthGuard)
  async getFriends(@Headers() headers) {
    try {
      const payload = getPayload(headers);
      return await this.friendsService.getFriends(payload.login);
    } catch (error) {
      return { error, body: null };
    }
  }

  /**
   * @param headers user_id from token payload
   * @param query friend_id from query
   *
   * @returns { error, body }
   */
  @Get('request')
  @UseGuards(AuthGuard)
  async addFriend(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      await this.friendsService.addFriendRequest(payload.id, +query.friend_id);
      return { error: null, body: null };
    } catch (error) {
      return { error, body: null };
    }
  }

  @Get('accept')
  @UseGuards(AuthGuard)
  async acceptFriend(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      await this.friendsService.acceptFriendRequest(
        payload.id,
        query.friend_id,
      );
      return { error: null, body: null };
    } catch (error) {
      return { error, body: null };
    }
  }

  @Get('decline')
  @UseGuards(AuthGuard)
  async declineFriend(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      await this.friendsService.declineFriendRequest(
        payload.id,
        query.friend_id,
      );
      return { error: null, body: null };
    } catch (error) {
      return { error, body: null };
    }
  }

  @Get('remove')
  @UseGuards(AuthGuard)
  async removeFriend(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      await this.friendsService.removeFriend(payload.id, query.friend_id);
      return { error: null, body: null };
    } catch (error) {
      return { error, body: null };
    }
  }
}
