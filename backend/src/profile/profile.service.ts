import { Injectable } from '@nestjs/common';
import { User, Achievement } from 'src/typeorm';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from 'src/typeorm/userstatus.enum';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Achievement)
    private readonly achieveRepo: Repository<Achievement>,
  ) {}

  async getProfile(login: string) {
    try {
      const user = await this.userRepo.findOne({ where: { login } });
      return { user };
    } catch (error) {
      throw error;
    }
  }

  async editProf(login: string, data: any) {
    try {
      const user = await this.userRepo.findOne({ where: { login } });
      if (data.nickname !== undefined) {
        const checkExist = await this.userRepo.findOne({
          where: { nickname: data.nickname },
        });
        if (checkExist) throw new Error('Nickname already exist');
        user.nickname = data.nickname;
      }
      if (data.avatar_url !== undefined) user.profpic_url = "http://localhost:3001/" + data.avatar_url;
      if (data.fullname !== undefined) user.full_name = data.fullname;
      user.save();
    } catch (error) {
      throw error;
    }
  }

  async editStatus(login: string, status: UserStatus) {
    try {
      const user = await this.userRepo.findOne({ where: { login } });
      user.status = status;
      user.save();
    } catch (error) {
      throw error;
    }
  }

  async addAchievement(login: string, achievement: number) {
    try {
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
