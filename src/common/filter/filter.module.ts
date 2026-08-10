import { Module } from '@nestjs/common';
import { FilterService } from './filter.service';
import { FilterController } from './filter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professional } from 'src/professional/entities/professional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Professional])],
  controllers: [FilterController],
  providers: [FilterService],
})
export class FilterModule {}
