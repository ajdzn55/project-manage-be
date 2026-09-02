import { TaskDto } from './task.dto';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import {
  TaskPriority,
  taskPriorityDesc,
  TaskStatus,
  taskStatusDesc,
} from '../../common/enums';
import { getEnumDescriptionString } from '../../common/utils';

export class CreateTaskDto extends OmitType(TaskDto, [
  'id',
  'status',
  'priority',
]) {
  /**
   * 작업 상태
   */
  @Expose()
  @IsEnum(TaskStatus)
  @IsOptional()
  @ApiPropertyOptional({
    enum: TaskStatus,
    description: `상태 [${getEnumDescriptionString(taskStatusDesc)}]`,
    default: TaskStatus.Todo,
  })
  status?: TaskStatus;

  /**
   * 우선순위
   */
  @Expose()
  @IsOptional()
  @IsEnum(TaskPriority)
  @ApiPropertyOptional({
    enum: TaskPriority,
    description: `우선순위 [${getEnumDescriptionString(taskPriorityDesc)}]`,
    default: TaskPriority.Low,
  })
  priority?: TaskPriority;

  /**
   * 프로젝트 ID
   */
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  projectId: string;
}
