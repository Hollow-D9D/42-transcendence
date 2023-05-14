import { Controller, Get, Post, Headers, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { getPayload } from 'src/auth/utils';
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
  async create(@Headers() headers) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (typeof payload.login !== 'string') {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        const logins: string[] = [payload.login];
        // add another login if necessary
        var mode: ChannelMode = null;
        // only set `mode` to a non-null value when a user sent something valid
        if (isValidChannelMode(payload.mode)) {
          mode = payload.mode as ChannelMode;
        }
        if (!mode) {
          // chat, not a channel
          if (typeof payload.target === 'string') logins.push(payload.target);
          // `target` user is expected to be provided
          else
            return {
              error: new Error(
                'No valid target user specified for the new chat!',
              ),
              body: null,
            };
        }
        // retreive user(s)
        const users = await this.chatService.users(logins);
        // and validate `login`, `target`, `name` and `password` whenever necessary
        if (!mode) {
          // chat, not a channel
          if (users.length !== 2) {
            // both `login` and `target` are expected to yield valid users
            // if not, the request in invalid
            return {
              error: new Error(
                'No valid target user specified for the new chat!',
              ),
              body: null,
            };
          }
          if (this.chatService.isBlocked(payload.login, payload.target)) {
            // `login` cannot create a chat with `target` that has blocked them
            return {
              error: new Error('You are blocked by the target user!'),
              body: null,
            };
          }
        } else {
          // channel, not a chat
          // not checking whether `users.length === 1` in case when
          // `validMode === true` since we expect that `login` provided
          // by ... is always valid
          if (
            typeof payload.name !== 'string' ||
            typeof payload.password !== 'string'
          ) {
            // doesn't have a valid `name` and `password` specified
            return {
              error: new Error(
                'No valid channel name and/or password specified!',
              ),
              body: null,
            };
          }
          // check that a chat with this name hasn't already been created
          const channelWithName = await this.chatService.channel(payload.name);
          if (channelWithName) {
            // channelWithName !== undefined
            return {
              error: new Error(
                'A channel with this name has already been created!',
              ),
              body: null,
            };
          }
          // check the validity of the password provided for PROTECTED channels
          if (
            mode == ChannelMode.PROTECTED &&
            !this.chatService.isValidPassword(payload.password)
          ) {
            return {
              error: new Error('The password provided is invalid!'),
              body: null,
            };
          }
        }
        // all main checks passed
        this.chatService.create(users, mode, payload.name, payload.password);
      } else {
        return {
          error: new Error('Invalid input'),
          body: null,
        };
      }
    } catch (error) {
      return { error, body: null };
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
  async leaveChannel(@Headers() headers) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (typeof payload.login !== 'string') {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (typeof payload.name !== 'string') {
          // doesn't have a valid channel `name` specified
          return {
            error: new Error('No valid channel name specified!'),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(payload.name);
        if (!channelWithName) {
          // no channel with this name
          return {
            error: new Error('No channel with this name!'),
            body: null,
          };
        }
        if (
          !(await this.chatService.isChannelMember(payload.name, payload.login))
        ) {
          // isn't a member of the channel
          return {
            error: new Error('You are not a member of this channel!'),
            body: null,
          };
        }
        this.chatService.leaveChannel(payload.login, payload.name);
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
  async joinChannel(@Headers() headers) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (typeof payload.login !== 'string') {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (typeof payload.name !== 'string') {
          // doesn't have a valid channel `name` specified
          return {
            error: new Error('No valid channel name specified!'),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(payload.name);
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
          typeof payload.password !== 'string' ||
          (!this.chatService.isValidPassword(payload.password) &&
            payload.password !== '')
        ) {
          // doesn't have a valid/empty-string `password` specified
          return {
            error: new Error('No valid password specified!'),
            body: null,
          };
        }
        this.chatService.joinChannel(
          payload.login,
          payload.name,
          payload.password,
        );
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
  async grantAdmin(@Headers() headers) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (typeof payload.login !== 'string') {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (
          typeof payload.name !== 'string' ||
          typeof payload.target !== 'string'
        ) {
          // doesn't have a valid channel `name`/`target` user specified
          return {
            error: new Error('No valid channel name/target user specified!'),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(payload.name);
        if (!channelWithName) {
          // no channel with this name
          return {
            error: new Error('No channel with this name!'),
            body: null,
          };
        }
        const userWithLogin = await this.chatService.users([
          payload.login,
          payload.target,
        ]);
        if (userWithLogin.length !== 2) {
          // no user with the username login
          return {
            error: new Error('No user with username login/target!'),
            body: null,
          };
        }
        this.chatService.grantAdmin(
          payload.login,
          payload.target,
          payload.name,
        );
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
  async revokeAdmin(@Headers() headers) {
    try {
      const payload = getPayload(headers);
      if (payload) {
        if (typeof payload.login !== 'string') {
          // shouldn't get here
          return {
            error: new Error('Invalid user info!'),
            body: null,
          };
        }
        if (
          typeof payload.name !== 'string' ||
          typeof payload.target !== 'string'
        ) {
          // doesn't have a valid channel `name` specified
          return {
            error: new Error('No valid channel name/target user specified!'),
            body: null,
          };
        }
        const channelWithName = await this.chatService.channel(payload.name);
        if (!channelWithName) {
          // no channel with this name
          return {
            error: new Error('No channel with this name!'),
            body: null,
          };
        }
        const userWithLogin = await this.chatService.users([
          payload.login,
          payload.target,
        ]);
        if (userWithLogin.length !== 2) {
          // no user with the username login
          return {
            error: new Error('No user with username login/target!'),
            body: null,
          };
        }
        this.chatService.revokeAdmin(
          payload.login,
          payload.target,
          payload.name,
        );
      }
    } catch (error) {
      return { error, body: null };
    }
  }
}
