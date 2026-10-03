import { Module } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Evaluation } from './entities/evaluation.entity';
import { User } from 'src/user/entities/user.entity';
import { Professional } from 'src/professional/entities/professional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evaluation, User, Professional]), JwtModule],
  controllers: [EvaluationController],
  providers: [EvaluationService],
  exports: [EvaluationService]
})
export class EvaluationModule {}
