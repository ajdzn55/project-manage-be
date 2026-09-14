import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { ProjectDto } from './project.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ProjectStatus, projectStatusDesc } from '../../common/enums';
import { getEnumDescriptionString } from '../../common/utils';

export class CreateProjectDto extends PickType(ProjectDto, [
  'name',
  'description',
  'startDate',
  'endDate',
]) {
  /**
   * 프로젝트 상태
   */
  @ApiPropertyOptional({
    enum: ProjectStatus,
    description: `상태 [${getEnumDescriptionString(projectStatusDesc)}]`,
    default: ProjectStatus.Planned,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
