import {
  Controller,
  Body,
  Post,
  Headers,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { getPayload } from 'src/utils/auth.utils';
import { AuthGuard } from 'src/auth/auth.guard';
import { ChannelMode, isValidChannelMode } from 'src/typeorm/channelmode.enum';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * CREATE A CHAT/CHANNEL
   *
   * FIVE KEY FIELDS VALIDATED (in parens -- whether mandatory for chats or
   * channels):
   * - `login` (chat/channel)
   * - `target` (chat)
   * - `mode` (channel)
   * - `name` (channel)
   * - `password` (channel)
   *
   * VALIDATIONS PERFORMED:
   * 1. for any input field that is about to be used the first time, an
   *    appropriate type check is performed
   * 2. for channels:
   *   - a user with login `login` is actually present in the DB
   *   - `mode` is one of the actual modes (PUBLIC/PRIVATE/PROTECTED)
   *   - there is no channel with the name `name` yet
   *   - `password` is valid for `PROTECTED` (see `isValidPassword` for more)
   * 3. for chats:
   *   - users with login `login` and `target` are actually present in the DB
   *   - `mode` is null or its value is invalid
   *   - `login` isn't banned by `target`
   */
  @Post('create')
  @UseGuards(AuthGuard)
  async create(@Headers() headers, @Body() body) {
    try {
      const query = JSON.parse(body.body);
      const payload = getPayload(headers);
      console.log(payload, 'query', query);
      if (payload) {
        if (!payload.login) {
          // shouldn't get here
          throw new Error('Invalid user info!');
        }
        const logins: string[] = [payload.login];
        // add another login if necessary
        let mode: ChannelMode = null;
        // only set `mode` to a non-null value when a user sent something valid
        if (isValidChannelMode(query.mode)) {
          mode = query.mode as ChannelMode;
        }
        console.log(mode);
        if (!mode) {
          // chat, not a channel
          if (query.target) logins.push(query.target);
          // `target` user is expected to be provided
          else
            throw new Error('No valid target user specified for the new chat!');
        }
        // retreive user(s)
        const users = await this.chatService.users(logins);
        // and validate `login`, `target`, `name` and `password` whenever necessary
        if (!mode) {
          // chat, not a channel
          if (users.length !== 2) {
            // both `login` and `target` are expected to yield valid users
            // if not, the request in invalid
            throw new Error('No valid target user specified for the new chat!');
          }
          if (this.chatService.isBlocked(payload.login, query.target)) {
            // `login` cannot create a chat with `target` that has blocked them
            console.log('banned');
            throw new Error('You are blocked by the target user!');
          }
        } else {
          // channel, not a chat
          // not checking whether `users.length === 1` in case when
          // `validMode === true` since we expect that `login` provided
          // by ... is always valid
          console.log('bool', !query.password);
          if (!query.name /* || !query.password*/) {
            console.log('no login/password');
            // doesn't have a valid `name` and `password` specified
            throw new Error('No valid channel name and/or password specified!');
          }
          // check that a chat with this name hasn't already been created
          const channelWithName = await this.chatService.channel(query.name);
          if (channelWithName) {
            // channelWithName !== undefined
            throw new Error(
              'A channel with this name has already been created!',
            );
          }
          // check the validity of the password provided for PROTECTED channels
          if (
            mode == ChannelMode.PROTECTED &&
            !this.chatService.isValidPassword(query.password)
          ) {
            throw new Error('The password provided is invalid!');
          }
        }
        // all main checks passed
        this.chatService.create(users, mode, query.name, query.password);
      } else {
        throw new Error('Invalid input');
      }
    } catch (error) {
      console.log(error.message);
      return { error: error.message, body: null };
    }
  }

  /**
   * LEAVE A CHANNEL
   *
   * `login` who wants to leave
   * `name` what channel to leave
   *
   * - check that the channel exists
   * - check that login is a channel member
   * - proceed to business logic (service.ts)
   */
  @Post('leaveChannel')
  @UseGuards(AuthGuard)
  async leaveChannel(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (!payload.login) {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (!query.name) {
          // doesn't have a valid channel `name` specified
          return {
            error: new Error('No valid channel name specified!'),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(query.name);
        if (!channelWithName) {
          // no channel with this name
          return {
            error: new Error('No channel with this name!'),
            body: null,
          };
        }
        if (
          !(await this.chatService.isChannelMember(query.name, payload.login))
        ) {
          // isn't a member of the channel
          return {
            error: new Error('You are not a member of this channel!'),
            body: null,
          };
        }
        this.chatService.leaveChannel(payload.login, query.name);
      }
    } catch (error) {
      return { error, body: null };
    }
  }

  /**
   * JOIN A CHANNEL
   *
   * `login` who's trying to join the channel
   * `password` of the channel
   * `name` the target channel
   *
   * - check that the channel exists
   * - check that login exists
   * - check that password is valid or an empty string
   * - proceed to business logic (service.ts)
   */
  @Post('joinChannel')
  @UseGuards(AuthGuard)
  async joinChannel(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (!payload.login) {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (!query.name) {
          // doesn't have a valid channel `name` specified
          return {
            error: new Error('No valid channel name specified!'),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(query.name);
        if (!channelWithName) {
          // no channel with this name
          return {
            error: new Error('No channel with this name!'),
            body: null,
          };
        }
        const userWithLogin = await this.chatService.users([payload.login]);
        if (userWithLogin.length !== 1) {
          // no user with the username login
          return {
            error: new Error('No user with username login!'),
            body: null,
          };
        }
        if (
          !query.password ||
          (!this.chatService.isValidPassword(query.password) &&
            query.password !== '')
        ) {
          // doesn't have a valid/empty-string `password` specified
          return {
            error: new Error('No valid password specified!'),
            body: null,
          };
        }
        this.chatService.joinChannel(payload.login, query.name, query.password);
      }
    } catch (error) {
      return { error, body: null };
    }
  }

  /**
   * GRANT ADMIN PRIVILEGES TO A CHANNEL MEMBER
   *
   * `login` who's trying to grant admin privileges
   * `target` the to-be admin
   * `name` the target channel
   *
   * - check that the channel exists
   * - check that login and target exist
   * - proceed to business logic (service.ts)
   */
  @Post('grantAdmin')
  @UseGuards(AuthGuard)
  async grantAdmin(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (!payload.login) {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (!query.name || !query.target) {
          // doesn't have a valid channel `name`/`target` user specified
          return {
            error: new Error('No valid channel name/target user specified!'),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(query.name);
        if (!channelWithName) {
          // no channel with this name
          return {
            error: new Error('No channel with this name!'),
            body: null,
          };
        }
        const userWithLogin = await this.chatService.users([
          payload.login,
          query.target,
        ]);
        if (userWithLogin.length !== 2) {
          // no user with the username login/target
          return {
            error: new Error('No user with username login/target!'),
            body: null,
          };
        }
        this.chatService.grantAdmin(payload.login, query.target, query.name);
      }
    } catch (error) {
      return { error, body: null };
    }
  }

  /**
   * REVOKE ADMIN PRIVILEGES FROM A CHANNEL MEMBER
   *
   * `login` who's trying to remove admin privileges
   * `target` who's admin privileges are about to get revoked
   * `name` the target channel
   *
   * - check that the channel exists
   * - check that login and target exist
   * - proceed to business logic (service.ts)
   */
  @Post('revokeAdmin')
  @UseGuards(AuthGuard)
  async revokeAdmin(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (!payload.login) {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (!query.name || !query.target) {
          // doesn't have a valid channel `name`/`target` user specified
          return {
            error: new Error('No valid channel name/target user specified!'),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(query.name);
        if (!channelWithName) {
          // no channel with this name
          return {
            error: new Error('No channel with this name!'),
            body: null,
          };
        }
        const userWithLogin = await this.chatService.users([
          payload.login,
          query.target,
        ]);
        if (userWithLogin.length !== 2) {
          // no user with the username login/target
          return {
            error: new Error('No user with username login/target!'),
            body: null,
          };
        }
        this.chatService.revokeAdmin(payload.login, query.target, query.name);
      }
    } catch (error) {
      return { error, body: null };
    }
  }

  /**
   * ADD A USER TO A CHANNEL
   *
   * `login` who's trying to add a user
   * `target` the to-be member
   * `name` the target channel
   *
   * - check that the channel exists
   * - check that login and target exist
   * - proceed to business logic (service.ts)
   */
  @Post('addToChannel')
  @UseGuards(AuthGuard)
  async addToChannel(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (!payload.login) {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (!query.name || !query.target) {
          // doesn't have a valid channel `name`/`target` user specified
          return {
            error: new Error('No valid channel name/target user specified!'),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(query.name);
        if (!channelWithName) {
          // no channel with this name
          return {
            error: new Error('No channel with this name!'),
            body: null,
          };
        }
        const userWithLogin = await this.chatService.users([
          payload.login,
          query.target,
        ]);
        if (userWithLogin.length !== 2) {
          // no user with the username login/target
          return {
            error: new Error('No user with username login/target!'),
            body: null,
          };
        }
        this.chatService.addToChannel(payload.login, query.target, query.name);
      }
    } catch (error) {
      return { error, body: null };
    }
  }

  /**
   * KICK A USER FROM A CHANNEL
   *
   * `login` who's trying to kick a user
   * `target` the to-be-kicked member
   * `name` the target channel
   *
   * - check that the channel exists
   * - check that login and target exist
   * - proceed to business logic (service.ts)
   */
  @Post('kickFromChannel')
  @UseGuards(AuthGuard)
  async kickFromChannel(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (!payload.login) {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (!query.name || !query.target) {
          // doesn't have a valid channel `name`/`target` user specified
          return {
            error: new Error('No valid channel name/target user specified!'),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(query.name);
        if (!channelWithName) {
          // no channel with this name
          return {
            error: new Error('No channel with this name!'),
            body: null,
          };
        }
        const userWithLogin = await this.chatService.users([
          payload.login,
          query.target,
        ]);
        if (userWithLogin.length !== 2) {
          // no user with the username login/target
          return {
            error: new Error('No user with username login/target!'),
            body: null,
          };
        }
        this.chatService.kickFromChannel(
          payload.login,
          query.target,
          query.name,
        );
      }
    } catch (error) {
      return { error, body: null };
    }
  }

  /**
   * BAN A USER FROM A CHANNEL
   *
   * `login` who's trying to ban a user
   * `target` the to-be-banned member
   * `name` the target channel
   *
   * - check that the channel exists
   * - check that login and target exist
   * - proceed to business logic (service.ts)
   */
  @Post('banFromChannel')
  @UseGuards(AuthGuard)
  async banFromChannel(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (!payload.login) {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (!query.name || !query.target) {
          // doesn't have a valid channel `name`/`target` user specified
          return {
            error: new Error('No valid channel name/target user specified!'),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(query.name);
        if (!channelWithName) {
          // no channel with this name
          return {
            error: new Error('No channel with this name!'),
            body: null,
          };
        }
        const userWithLogin = await this.chatService.users([
          payload.login,
          query.target,
        ]);
        if (userWithLogin.length !== 2) {
          // no user with the username login/target
          return {
            error: new Error('No user with username login/target!'),
            body: null,
          };
        }
        this.chatService.banFromChannel(
          payload.login,
          query.target,
          query.name,
        );
      }
    } catch (error) {
      return { error, body: null };
    }
  }

  /**
   * UNBAN A USER FOR A CHANNEL
   *
   * `login` who's trying to unban a user
   * `target` the to-be-unbanned member
   * `name` the target channel
   *
   * - check that the channel exists
   * - check that login and target exist
   * - proceed to business logic (service.ts)
   */
  @Post('unbanForChannel')
  @UseGuards(AuthGuard)
  async unbanForChannel(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (!payload.login) {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (!query.name || !query.target) {
          // doesn't have a valid channel `name`/`target` user specified
          return {
            error: new Error('No valid channel name/target user specified!'),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(query.name);
        if (!channelWithName) {
          // no channel with this name
          return {
            error: new Error('No channel with this name!'),
            body: null,
          };
        }
        const userWithLogin = await this.chatService.users([
          payload.login,
          query.target,
        ]);
        if (userWithLogin.length !== 2) {
          // no user with the username login/target
          return {
            error: new Error('No user with username login/target!'),
            body: null,
          };
        }
        this.chatService.unbanForChannel(
          payload.login,
          query.target,
          query.name,
        );
      }
    } catch (error) {
      return { error, body: null };
    }
  }

  /**
   * MUTE A CHANNEL USER
   *
   * `login` who's trying to mute a user
   * `target` the to-be-muted member
   * `duration` of the mute
   * `name` the target channel
   *
   * - check that the channel exists
   * - check that login and target exist
   * - check that duration is a number, in minutes
   * - proceed to business logic (service.ts)
   */
  @Post('muteForChannel')
  @UseGuards(AuthGuard)
  async muteForChannel(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (!payload.login) {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (!query.name || !query.target || !query.duration) {
          // doesn't have a valid channel `name`/`target` user/mute `duration` specified
          return {
            error: new Error(
              'No valid channel name/target user/mute duration specified!',
            ),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(query.name);
        if (!channelWithName) {
          // no channel with this name
          return {
            error: new Error('No channel with this name!'),
            body: null,
          };
        }
        const userWithLogin = await this.chatService.users([
          payload.login,
          query.target,
        ]);
        if (userWithLogin.length !== 2) {
          // no user with the username login/target
          return {
            error: new Error('No user with username login/target!'),
            body: null,
          };
        }
        const duration = Number(query.duration);
        if (isNaN(duration)) {
          // duration isn't a number
          return {
            error: new Error('Invalid mute duration specified!'),
            body: null,
          };
        }
        this.chatService.muteForChannel(
          payload.login,
          query.target,
          duration,
          query.name,
        );
      }
    } catch (error) {
      return { error, body: null };
    }
  }

  /**
   * UNMUTE A CHANNEL USER
   *
   * `login` who's trying to unmute a user
   * `target` the to-be-unmuted member
   * `name` the target channel
   *
   * - check that the channel exists
   * - check that login and target exist
   * - proceed to business logic (service.ts)
   */
  @Post('unmuteForChannel')
  @UseGuards(AuthGuard)
  async unmuteForChannel(@Headers() headers, @Query() query) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (!payload.login) {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (!query.name || !query.target) {
          // doesn't have a valid channel `name`/`target` user specified
          return {
            error: new Error('No valid channel name/target user specified!'),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(query.name);
        if (!channelWithName) {
          // no channel with this name
          return {
            error: new Error('No channel with this name!'),
            body: null,
          };
        }
        const userWithLogin = await this.chatService.users([
          payload.login,
          query.target,
        ]);
        if (userWithLogin.length !== 2) {
          // no user with the username login/target
          return {
            error: new Error('No user with username login/target!'),
            body: null,
          };
        }
        this.chatService.unmuteForChannel(
          payload.login,
          query.target,
          query.name,
        );
      }
    } catch (error) {
      return { error, body: null };
    }
  }

  // @Post()
  // @UseGuards(AuthGuard)
  // async grantAdmin(@Headers() headers) {
  //   try {
  //     const payload = getPayload(headers);
  //     if (payload) {
  //       if (!payload.login) {
  //         // shouldn't get here
  //         return {
  //           error: new Error('Invalid user info!'),
  //           body: null,
  //         };
  //       }
  //       if (!query.name) {
  //         // doesn't have a valid channel `name` specified
  //         return {
  //           error: new Error('No valid channel name specified!'),
  //           body: null,
  //         };
  //       }
  //       // continue here
  //     }
  //   } catch (error) {
  //     return { error, body: null };
  //   }
  // }
}
