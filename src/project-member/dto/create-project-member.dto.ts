import { PickType } from '@nestjs/swagger';
import { ProjectMemberDto } from './project-member.dto';

export class CreateProjectMemberDto extends PickType(ProjectMemberDto, [
  'userId',
]) {}
