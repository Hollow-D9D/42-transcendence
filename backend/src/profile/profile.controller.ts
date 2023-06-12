import {
  Controller,
  Get,
  Post,
  Res,
  Param,
  Headers,
  Header,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { getPayload } from 'src/utils/auth.utils';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { File } from 'multer';
import * as fs from 'fs';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/upload', // Specify the destination folder
        filename: (req, file, cb) => {
          const fileName = `${Date.now()}-${file.originalname}`;

          cb(null, fileName); // Set the filename
        },
      }),
      fileFilter: (_, file, cb) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        const ext = extname(file.originalname);
        if (allowedExtensions.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error('Only JPG, JPEG, and PNG files are allowed'), false);
        }
      },
      limits: {
        fileSize: 1024 * 1024 * 25, // Limit file size to 1MB
      },
    }),
  )
  uploadFile(@UploadedFile() file: File) {
    return {
      originalName: file.originalname,
      fileName: file.filename,
    };
  }

  @Get('getProfPic')
  @UseGuards(AuthGuard)
  @Header('Content-Type', 'image/png')
  async getProfPic(@Headers() headers, @Res() response) {
    try {
      const payload = getPayload(headers);
      const { user } = await this.profileService.getProfile(payload.login);

      if (!user.profpic_url.startsWith('http')) {
        fs.readFile(`src/upload/${user.profpic_url}`, (err, data) => {
          console.log('data', data, 'err', err);

          if (err) throw new Error('Image not found');
          else {
            response.setHeader('Content-Type', 'image/png');
            response.send(data);
            // return { error : null, imageData: data }
          }
        });
      }
      return { error: new Error('No user found!'), body: null };
    } catch (error) {
      return { error, body: null };
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  async getProfile(@Headers() headers) {
    try {
      const payload = getPayload(headers);
      
      const { user } = await this.profileService.getProfile(payload.login);
      if (user)
        return {
          error: null,
          body: {
            user,
          },
        };
      return { error: new Error('No user found!'), body: null };
    } catch (error) {
      return { error, body: null };
    }
  }

  @Get('PublicProfile')
  @UseGuards(AuthGuard)
  async getPublicProfile(@Headers() headers, @Query() params) {
    try {
      const payload = getPayload(headers);
      // console.log("payload:::", params.login);
      
      const { user } = await this.profileService.getProfile(params.login);
      if (user)
        return {
          error: null,
          body: {
            user,
          },
        };
      return { error: new Error('No user found!'), body: null };
    } catch (error) {
      return { error, body: null };
    }
  }

  @Get('editNickname')
  @UseGuards(AuthGuard)
  async editNickname(@Headers() headers, @Query() params) {
    try {
      const payload = getPayload(headers);
      await this.profileService.editProf(payload.login, params.newdata);
      return { error: null, body: null };
    } catch (error) {
      console.log(error);

      return { error, body: null };
    }
  }

  @Get('addAchievement')
  @UseGuards(AuthGuard)
  async addAchievement(@Headers() headers, @Param() params) {
    try {
      const payload = getPayload(headers);
      await this.profileService.addAchievement(
        payload.login,
        params.achievement,
      );
      return { error: null, body: null };
    } catch (error) {
      return { error, body: null };
    }
  }

  @Get('getAchievements')
  @UseGuards(AuthGuard)
  async getAchievements(@Headers() headers) {
    try {
      const payload = getPayload(headers);
      const achievements = await this.profileService.getAchievements(
        payload.login,
      );
      return { error: null, body: { achievements } };
    } catch (error) {
      return { error, body: null };
    }
  }
}
