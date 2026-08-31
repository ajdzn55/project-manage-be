import { TaskDto } from './task.dto';
import { OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTaskDto extends OmitType(TaskDto, ['id']) {
  /**
   * 프로젝트 ID
   */
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  projectId: string;
}
