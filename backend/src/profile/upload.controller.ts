import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { File } from 'multer';

@Controller()
export class UploadController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: '../../../frontend/public/upload', // Specify the destination folder
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
        fileSize: 1024 * 1024, // Limit file size to 1MB
      },
    }),
  )
  uploadFile(@UploadedFile() file: File) {
    // Handle the uploaded file
    return {
      originalName: file.originalname,
      fileName: file.filename,
    };
  }
}
