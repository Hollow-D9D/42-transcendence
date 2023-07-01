import { Inject, Injectable, CACHE_MANAGER } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameMatch } from 'src/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { ProfileService } from 'src/profile/profile.service';
import { User, Match } from 'src/typeorm';
import { AchievementsService } from 'src/achievements/achievements.service';

@Injectable()
export class GameMatchService {
  constructor(
    @InjectRepository(GameMatch)
    private readonly gameMatchRepo: Repository<GameMatch>,
    @Inject(CACHE_MANAGER) private cacheM: Cache,
    private readonly profileService: ProfileService,
    private readonly achievementService: AchievementsService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Match) private readonly matchRepo: Repository<Match>,
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
        const queue: Array<User> = await this.cacheM.get('queue');
        if (queue.length >= 2) {
          const response = await this.startMatch(queue.shift(), queue.shift());
          return { matching: true, response };
        }
        return { matching: false };
      }
      return { matching: false };
    } catch (err) {
      throw err;
    }
  }

  async startMatch(player1, player2): Promise<GameMatch> {
    try {
      const queue: Array<User> = await this.cacheM.get('queue');
      const match = new GameMatch();
      match.player1 = player1;
      match.player2 = player2;
      const newmatch = await match.save();
      await this.cacheM.set('queue', queue, 0);
      return newmatch;
    } catch (err) {
      throw err;
    }
  }

  // duration, leftWon, winner_score, loser_score
  async endGame(stats: any, game_match_id: number) {
    // const winner_user = await this.userRepo.findOne({ where: { login: winner } });
    // const loser_user = await this.userRepo.findOne({ where: { login: loser } });
    try {
      const liveGame = await this.gameMatchRepo.findOne({
        where: { id: game_match_id },
        relations: ['player1', 'player2'],
      });
      const match = new Match();
      let winnerUser = stats.leftWon ? liveGame.player1 : liveGame.player2;
      let loserUser = !stats.leftWon ? liveGame.player1 : liveGame.player2;
      match.winnerLogin = winnerUser.login;
      match.loserLogin = loserUser.login;
      match.duration = (match.duration || 0) + parseInt(stats.duration);
      match.playedOn = liveGame.playedOn;
      match.winnerScore = stats.winner_score;
      match.loserScore = stats.loser_score;
      // console.log(match);
      winnerUser.win_count++;
      if (winnerUser.win_count === 1)
        this.achievementService.addAchievement(winnerUser.id, 'first_win');
      if (winnerUser.win_count === 5)
        this.achievementService.addAchievement(winnerUser.id, 'killing_spree');
      if (loserUser.lose_count === 5)
        this.achievementService.addAchievement(loserUser.id, 'fivth_loss');

      loserUser.lose_count++;
      winnerUser.matchtime += parseInt(stats.duration);
      loserUser.matchtime += parseInt(stats.duration);
      winnerUser.status = 1;
      loserUser.status = 1;
      await winnerUser.save();
      await loserUser.save();
      // console.log();
      await this.matchRepo.save(match);
      // await match.save();
      await liveGame.remove();
    } catch (err) {
      throw err;
    }
  }

  // async checkPermission(login: string, chat_id: number) {
  //   let bool = false;
  //   try {
  //     const user = await this.userRepo.findOne({
  //       where: { login },
  //       relations: ['chatsMemberOf'],
  //     });
  //     if (user)
  //       user.chatsMemberOf.map((item) => {
  //         if (item.id == chat_id) bool = true;
  //       });
  //     return bool;
  //   } catch (err) {
  //     throw err;
  //   }
  // }

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
      await this.cacheM.set('queue', queue, 0);
    } catch (err) {
      throw err;
    }
  }
}
