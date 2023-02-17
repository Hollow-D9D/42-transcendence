import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm';
import axios from 'axios';

interface user42 {
  login: string;
  full_name: string;
  profpic_url: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async auth42(u_code, u_state): Promise<user42> {
    let me: any;
    try {
      const token = await axios.post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id: process.env.API42_CID,
        client_secret: process.env.API42_CSECRET,
        code: u_code,
        redirect_uri: process.env.API42_REDIRECTURI,
        state: u_state,
      });
      me = await axios.get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${token.data.access_token}`,
        },
      });
      return {
        login: me.data.login ? me.data.login : null,
        full_name: me.data.displayname ? me.data.displayname : null,
        profpic_url: me.data.image.link ? me.data.image.link : null,
      };
    } catch (err) {
      return null;
    }
  }

  async checkUser(login: string): Promise<boolean> {
    const count = await this.userRepo.count({ where: { login: login } });
    return count > 0;
  }

  createUser(userInfo: any) {
    console.log('creating user');
    const newUser = this.userRepo.create(userInfo);
    this.userRepo.save(newUser);
  }

  loginUser(userInfo: any) {
    console.log('login process, jwt');
    // const newUser = this.userRepo.create(userInfo);
    // this.userRepo.save(newUser);
  }
}
