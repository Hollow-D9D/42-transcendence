import { Controller, Get, Param, Headers, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { getPayload } from 'src/auth/utils';
import { AuthGuard } from 'src/auth/auth.guard';
import { ChannelMode, isValidChannelMode } from 'src/typeorm/channelmode.enum';

@Controller('profile')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // FIVE KEY FIELDS VALIDATED (in parens -- whether mandatory for chats or
  // channels):
  // - `login` (chat/channel)
  // - `target` (chat)
  // - `mode` (channel)
  // - `name` (channel)
  // - `password` (channel)
  //
  // VALIDATIONS PERFORMED:
  // 1. for any input field that is about to be used the first time, an
  //    appropriate type check is performed
  // 2. for channels:
  //   - a user with login `login` is actually present in the DB
  //   - `mode` is one of the actual modes (PUBLIC/PRIVATE/PROTECTED)
  //   - there is no channel with the name `name` yet
  //   - `password` is valid for `PROTECTED` (see `isValidPassword` for more)
  // 3. for chats:
  //   - users with login `login` and `target` are actually present in the DB
  //   - `mode` is null or its value is invalid
  //   - `login` isn't banned by `target`
  @Get()
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
        const users = await this.chatService.getUsers(logins);
        // and validate `login`, `target`, `name` and `password` whenever necessary
        if (!mode) {
          // chat, not a channel
          if (users.length != 2) {
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
          const chatWithName = await this.chatService.getName(payload.name);
          if (chatWithName) {
            // chatWithName !== undefined
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
}
