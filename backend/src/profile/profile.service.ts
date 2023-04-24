import { Injectable } from '@nestjs/common';
import { User, Achievement } from 'src/typeorm';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Achievement)
    private readonly achieveRepo: Repository<Achievement>,
  ) {}

  // TODO: why call it `getProfile` and not just `get`? there's `Profile` in
  // the name of the service anyway plus there'll probably already be
  // "profile" somewhere in the endpoint
  async getProfile(login: string) {
    try {
      const user = await this.userRepo.findOne({ where: { login } });
      return { user };
    } catch (error) {
      throw error;
    }
  }

  // TODO: why `editProf` and not `edit` or `editProfile`?
  async editProf(login: string, data: any) {
    try {
      const user = await this.userRepo.findOne({ where: { login } });
      // TODO: since `data` is of type `any`, can the user pass some garbage in
      // the value of one of the keys `nickname`/`avatar_url`/`fullname` to make
      // the type coercion in assignments in one of the next three lines fail and
      // thus break our app?
      if (data.nickname !== undefined) user.nickname = data.nickname;
      if (data.avatar_url !== undefined) user.profpic_url = data.avatar_url; // TODO: why `avatar_url` and not `profpic_url`?
      if (data.fullname !== undefined) user.full_name = data.fullname; // TODO: why `fullname` and not `full_name`?
      user.save();
    } catch (error) {
      throw error;
    }
  }

  async addAchievement(login: string, achievement: number) {
    try {
      // TODO: this can and probably should get replaced with
      // const user = await this.userRepo.findOne({
      //   where: { login },
      //   relations: ['achievements'],
      // });
      const user = await this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.achievements', 'achievement')
        .where('user.login = :login', { login })
        .getOne();
      const achieve = await this.achieveRepo.findOne({
        where: { id: achievement },
      });
      user.achievements.push(achieve);
      user.save();
    } catch (error) {
      throw error;
    }
  }

  async getAchievements(login: string) {
    try {
      // TODO: same as in addAchievement()
      const user = await this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.achievements', 'achievement')
        .where('user.login = :login', { login })
        .getOne();
      return user.achievements;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param login
   * @param amount can get +/- values to change ladder level
   */
  async changeLevel(login: string, amount: number) {
    try {
      // TODO: same as in addAchievement()
      const user = await this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.achievements', 'achievement')
        .where('user.login = :login', { login })
        .getOne();
      user.ladder_level += amount;
      user.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param login
   * @param score 0 for lose, 1 for win
   */
  async incrementLoseOrWin(login: string, score: number) {
    try {
      const user = await this.userRepo.findOne({ where: { login } });
      if (score === 0) user.lose_count += 1;
      else user.win_count += 1;
      user.save();
    } catch (error) {
      throw error;
    }
  }
}
