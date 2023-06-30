import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { AchievementsService } from 'src/achievements/achievements.service';

interface user42 {
  login: string;
  full_name: string;
  profpic_url: string;
  nickname: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheM: Cache,
    private readonly achieveService: AchievementsService,
  ) {}

  async auth42(u_code, u_state): Promise<user42> {
    let me: any;
    try {
      const token = await axios.post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id: process.env.API42_CID,
        client_secret: process.env.API42_CSECRET,
        code: u_code,
        redirect_uri: process.env.API42_URL,
        state: u_state,
      });
      if (token.data.error) throw new Error(token.data.error);
      me = await axios.get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${token.data.access_token}`,
        },
      });
      return {
        login: me.data.login ? me.data.login : null,
        nickname: me.data.login ? me.data.login : null,
        full_name: me.data.displayname ? me.data.displayname : null,
        profpic_url: me.data.image.link ? me.data.image.link : null,
      };
    } catch (err) {
      throw err;
    }
  }

  async checkUser(login: string): Promise<boolean> {
    try {
      const count = await this.userRepo.count({ where: { login: login } });
      return count > 0;
    } catch (err) {
      throw err;
    }
  }

  createUser(userInfo: any) {
    const newUser = this.userRepo.create(userInfo);
    this.userRepo.insert(newUser).then((res) => {
      this.achieveService.addAchievement(res.identifiers[0].id, 'first_login');
    });
  }

  async loginUser(userInfo: any) {
    try {
      if (await this.checkUser(userInfo.login)) {
        const user = await this.userRepo.findOne({
          where: { login: userInfo.login },
        });
        const token = this.jwtService.sign(
          {
            id: user.id,
            login: userInfo.login,
          },
          { secret: process.env.JWT_SECRET },
        );
        const list: Array<string> = (await this.cacheM.get('logged_in'))
          ? await this.cacheM.get('logged_in')
          : [];
        if (!list.includes(userInfo.login)) {
          list.push(userInfo.login);
        }
        await this.cacheM.set('logged_in', list, 0);
        user.status = 1;
        await user.save();
        return {
          error: null,
          body: {
            token,
            two_factor: user.two_factor_token ? true : false,
          },
        };
      }
    } catch (err) {
      throw err;
    }
  }

  async logoutUser(login: string) {
    try {
      let list: Array<string> = (await this.cacheM.get('logged_in'))
        ? await this.cacheM.get('logged_in')
        : [];
      list = list.splice(list.indexOf(login), 1);
      await this.cacheM.set('logged_in', list, 0);
      const user = await this.userRepo.findOne({
        where: { login: login },
      });
      user.status = 0;
      await user.save();
      return {
        error: null,
        body: null,
      };
    } catch (err) {
      throw err;
    }
  }
}
