import { PickType } from '@nestjs/swagger';
import { ProjectDto } from './project.dto';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectDto extends PickType(ProjectDto, [
  'name',
  'description',
  'startDate',
  'endDate',
  'status',
]) {
  /**
   * 생성자 id
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  createdById: string;
}
