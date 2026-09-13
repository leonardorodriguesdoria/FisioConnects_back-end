import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { OtpModule } from 'src/otp/otp.module';
import { EmailModule } from 'src/email/email.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ConfigModule} from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ProfessionalModule } from 'src/professional/professional.module';
import { Professional } from 'src/professional/entities/professional.entity';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './profilePicturesUploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;

          callback(null, filename);
        },
      }),
    }),TypeOrmModule.forFeature([User, Professional]), JwtModule, ProfessionalModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule{}
