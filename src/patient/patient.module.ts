import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/user/entities/user.entity';
import { PatientService } from './patient.service';
import { JwtModule } from '@nestjs/jwt';
import { PatintController } from './patient.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User]), AuthModule, JwtModule],
    controllers: [PatintController],
    providers: [PatientService],
    exports: [PatientService]
})
export class PatientModule {}
