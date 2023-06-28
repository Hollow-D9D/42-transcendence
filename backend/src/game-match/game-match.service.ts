import { Inject, Injectable, CACHE_MANAGER } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameMatch } from 'src/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { ProfileService } from 'src/profile/profile.service';
import { User } from 'src/typeorm';

@Injectable()
export class GameMatchService {
  constructor(
    @InjectRepository(GameMatch)
    private readonly gameMatchRepo: Repository<GameMatch>,
    @Inject(CACHE_MANAGER) private cacheM: Cache,
    private readonly profileService: ProfileService,
  ) {
    this.cacheM.set('queue', [], 0);
  }

  async addToQueue(login: string) {
    try {
      const queue: Array<User> =
        (await this.cacheM.get('queue')) == undefined
          ? []
          : await this.cacheM.get('queue');
      if (queue.length > 0) {
        queue.forEach((element) => {
          if (element.login === login) {
            throw new Error('User already in queue');
          }
        });
      }
      const user = await this.profileService.getProfile(login);
      queue.push(user.user);
      console.log(queue);
      await this.cacheM.set('queue', queue, 0);
      const response = await this.matchPlayers(queue);
      return response;
    } catch (err) {
      throw err;
    }
  }

  async getInviteInfo(target: string) {
    return await this.profileService.getProfile(target);
  }

  async matchPlayers(queue: Array<User>) {
    try {
      if (queue.length % 2 == 0) {
        const response = await this.startMatch();
        return { matching: true, response };
      }
      return { matching: false };
    } catch (err) {
      throw err;
    }
  }

  async startMatch(): Promise<GameMatch> {
    try {
      const queue: Array<User> = await this.cacheM.get('queue');
      if (queue.length >= 2) {
        const player1 = queue.shift();
        const player2 = queue.shift();
        const match = new GameMatch();
        match.player1 = player1;
        match.player2 = player2;
        const newmatch = await match.save();
        await this.cacheM.set('queue', queue, 0);
        return newmatch;
      }
    } catch (err) {
      throw err;
    }
  }

  async endMatch(match_id: number) {
    try {
      await GameMatch.delete({ id: match_id });
    } catch (err) {
      throw err;
    }
  }

  async cancelMatchLookup(login: string) {
    try {
      let queue: Array<User> = await this.cacheM.get('queue');
      queue = queue.filter((element) => {
        return element.login !== login;
      });
      console.log(queue);
      await this.cacheM.set('queue', queue, 0);
    } catch (err) {
      throw err;
    }
  }
}
