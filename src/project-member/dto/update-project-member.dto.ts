import { ProjectMemberDto } from './project-member.dto';
import { PickType } from '@nestjs/swagger';

export class UpdateProjectMemberDto extends PickType(ProjectMemberDto, [
  'userId',
  'role',
]) {}
