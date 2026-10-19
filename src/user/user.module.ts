import { BadRequestException, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { OtpModule } from 'src/otp/otp.module';
import { EmailModule } from 'src/email/email.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { ConfigModule} from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ProfessionalModule } from 'src/professional/professional.module';
import { Professional } from 'src/professional/entities/professional.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthModule } from 'src/auth/auth.module';

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

@Module({
  imports: [
    CloudinaryModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
      },
      fileFilter:(_request, file, callback) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Formato inválido. Envie uma imagem JPEG, PNG ou WebP.',
            ),
            false,
          );
        }
        callback(null, true);
      }
    }),TypeOrmModule.forFeature([User, Professional]), JwtModule, ProfessionalModule, CloudinaryModule, AuthModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule{}
