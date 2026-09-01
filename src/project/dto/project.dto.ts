import { Expose, Type } from 'class-transformer';
import { ProjectStatus, projectStatusDesc } from '../../common/enums';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { getEnumDescriptionString } from '../../common/utils';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UserDto } from '../../user/dto/user.dto';

export class ProjectDto {
  /**
   * 프로젝트 ID
   */
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  /**
   * 프로젝트명
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * 프로젝트 설명
   */
  @Expose()
  @IsOptional()
  @IsString()
  description?: string | null;

  /**
   * 시작일자
   * @example 2026-08-28
   */
  @Expose()
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  /**
   * 종료일자
   * @example 2026-08-28
   */
  @Expose()
  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  /**
   * 생성자
   */
  @Expose()
  @Type(() => UserDto)
  createdBy: UserDto;

  /**
   * 프로젝트 상태
   */
  @Expose()
  @IsOptional()
  @IsEnum(ProjectStatus)
  @ApiProperty({
    enum: ProjectStatus,
    description: `상태 [${getEnumDescriptionString(projectStatusDesc)}]`,
  })
  status?: ProjectStatus | null;
}

export class ProjectSimpleDto extends OmitType(ProjectDto, [
  'createdBy',
  'description',
]) {
  /**
   * 생성자 id
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  createdById: string;
}
