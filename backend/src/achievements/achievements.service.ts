import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement, User } from 'src/typeorm';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private readonly achieveRepo: Repository<Achievement>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    this.seedAchiements();
  }

  achieves = [
    {
      id: 1,
      name: 'Welcome',
      alias: 'first_login',
      icon: process.env.BACKEND_URL + '/upload/handshake.png',
      description: 'Congratulations with your registration!',
      level: 1,
      progress: 1,
    },
    {
      id: 2,
      name: 'First blood',
      alias: 'first_win',
      icon: process.env.BACKEND_URL + '/upload/win.png',
      description: 'First enemy is slayed!',
      level: 1,
      progress: 1,
    },
    {
      id: 3,
      name: 'Friendly Potato',
      alias: 'first_friend',
      icon: process.env.BACKEND_URL + '/upload/social.png',
      description:
        'Being potato is hard, being a friendly potato is even harder',
      level: 1,
      progress: 1,
    },
    {
      id: 4,
      name: 'BloodSeeker',
      alias: 'killing_spree',
      icon: process.env.BACKEND_URL + '/upload/blood.png',
      description: 'I crave blood!',
      level: 1,
      progress: 1,
    },
    {
      id: 5,
      name: 'Bad day',
      alias: 'fivth_loss',
      icon: process.env.BACKEND_URL + '/upload/dummy.png',
      description: 'Lost 5 times',
      level: 1,
      progress: 1,
    },
  ];

  async getAchievements() {
    try {
      const achieves = await this.achieveRepo.find();
      return { achieves };
    } catch (error) {
      throw error;
    }
  }

  async addAchievement(user_id: number, achieve_alias: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: user_id },
        relations: ['achievements'],
      });
      const achieve = await this.achieveRepo.findOne({
        where: { alias: achieve_alias },
      });
      user.achievements.push(achieve);
      await this.userRepo.save(user);
      return { user };
    } catch (error) {
      throw error;
    }
  }

  async seedAchiements() {
    try {
      // await this.achieveRepo
      //   .createQueryBuilder('user_achievement')
      //   .delete()
      //   // .where("id = :id", { id: 1 })
      //   .execute();

      const aches = await this.achieveRepo.find();
      if (aches.length == 0) {
        await Promise.all(
          this.achieves.map(async (achieve) => {
            const newOne = this.achieveRepo.create(achieve);
            await this.achieveRepo.save(newOne);
          }),
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
