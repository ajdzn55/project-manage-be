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
import { ProjectMemberDto } from '../../project-member/dto/project-member.dto';

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
   * 생성자 아이디
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  createdById: string;

  /**
   * 프로젝트 상태
   */
  @Expose()
  @IsEnum(ProjectStatus)
  @ApiProperty({
    enum: ProjectStatus,
    description: `상태 [${getEnumDescriptionString(projectStatusDesc)}]`,
    default: ProjectStatus.Planned,
  })
  status: ProjectStatus;

  /**
   * 프로젝트 멤버
   */
  @Expose()
  @Type(() => ProjectMemberDto)
  @ApiProperty({ type: () => ProjectMemberDto, isArray: true })
  members?: ProjectMemberDto[];
}

export class ProjectSimpleDto extends OmitType(ProjectDto, [
  'description',
  'members',
]) {}
