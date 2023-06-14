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
      name: '#1',
      icon: 'path/to/icon.png',
      description: 'The 1st one',
      level: 1,
      progress: 1,
    },
    {
      name: '#2',
      icon: 'path/to/icon.png',
      description: 'The 2st one',
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

  async seedAchiements() {
    try {
      // await this.achieveRepo.clear();
      await Promise.all(
        this.achieves.map(async (achieve) => {
          const newOne = this.achieveRepo.create(achieve);
          await this.achieveRepo.save(newOne);
        }),
      );
    } catch (error) {
      throw error;
    }
  }
}
