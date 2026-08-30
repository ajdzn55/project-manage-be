import { PickType } from '@nestjs/swagger';
import { ProjectSimpleDto } from './project.dto';

export class CreateProjectDto extends PickType(ProjectSimpleDto, [
  'name',
  'description',
  'startDate',
  'endDate',
  'status',
  'createdById',
]) {}
