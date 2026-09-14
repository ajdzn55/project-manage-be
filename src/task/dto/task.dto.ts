import { Expose } from 'class-transformer';
import {
  TaskPriority,
  taskPriorityDesc,
  TaskStatus,
  taskStatusDesc,
} from '../../common/enums';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { getEnumDescriptionString } from '../../common/utils';
import { IsBooleanQuery } from '../../common/decorators/is-boolean-query.decorator';

export class TaskDto {
  /**
   * 작업 ID
   */
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  /**
   * 작업명
   */
  @Expose()
  @IsString()
  name: string;

  /**
   * 작업 설명
   */
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * 작업 상태
   */
  @Expose()
  @IsEnum(TaskStatus)
  @ApiProperty({
    enum: TaskStatus,
    description: `상태 [${getEnumDescriptionString(taskStatusDesc)}]`,
    default: TaskStatus.Todo,
  })
  status: TaskStatus;

  /**
   * 우선순위
   */
  @Expose()
  @IsEnum(TaskPriority)
  @ApiProperty({
    enum: TaskPriority,
    description: `우선순위 [${getEnumDescriptionString(taskPriorityDesc)}]`,
    default: TaskPriority.Low,
  })
  priority: TaskPriority;

  /**
   * 담당자 아이디
   */
  @Expose()
  @IsOptional()
  @IsString()
  assigneeId?: string | null;

  /**
   * 마감일자
   * @example 2026-08-31
   */
  @Expose()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  /**
   * 생성자 아이디
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  createdById: string;

  /**
   * 캘린더 색상
   */
  @Expose()
  @IsString()
  @IsNotEmpty()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'backgroundColor는 #을 포함한 6자리 16진수여야 합니다.',
  })
  backgroundColor: string;
}

export class TaskSearchQueryDto {
  /**
   * 프로젝트 ID
   */
  @Expose()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  /**
   * 조회년월
   * @example 2026-09
   */
  @Expose()
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month는 yyyy-MM 형식이어야 합니다.',
  })
  month?: string;

  /**
   * 내 작업만 조회 여부
   */
  @Expose()
  @IsOptional()
  @IsBooleanQuery()
  isMyTask?: boolean;
}
