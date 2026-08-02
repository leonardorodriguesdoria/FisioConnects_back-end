import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OtpModule } from './otp/otp.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { OTP } from './otp/entities/otp.entity';
import { EmailModule } from './email/email.module';
import { FilterModule } from './common/filter/filter.module';
import { ClinicalPatient } from './clinical_patients/entities/patient.entity';
import { MedicalRecord } from './medical_record/entities/medicalRecord.entity';
import { Evolution } from './clinical_patients/entities/evolution.entity';
import { PatientsModule } from './clinical_patients/patients.module';
import { ProfessionalModule } from './professional/professional.module';
import { MedicalRecordModule } from './medical_record/medical_record.module';
import { Professional } from './professional/entities/professional.entity';


@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: Number(configService.get('DB_PORT')),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, OTP, ClinicalPatient, MedicalRecord, Evolution, Professional],
        migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    OtpModule,
    EmailModule,
    FilterModule,
    PatientsModule,
    ProfessionalModule,
    MedicalRecordModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
