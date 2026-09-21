import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ProjectMemberService } from './project-member.service';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';

@ApiTags('프로젝트 멤버')
@Controller('project/:projectId/members')
export class ProjectMemberController {
  constructor(private readonly projectMemberService: ProjectMemberService) {}

  @ApiOperation({ summary: '프로젝트 멤버 추가' })
  @ApiCreatedResponse({ type: String, description: '성공' })
  @ApiBody({
    type: () => CreateProjectMemberDto,
  })
  @Post()
  create(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() projectMemberDto: CreateProjectMemberDto,
  ): Promise<void> {
    return this.projectMemberService.create(projectId, projectMemberDto);
  }

  @ApiOperation({ summary: '프로젝트 멤버 삭제' })
  @ApiOkResponse({
    description: '성공',
  })
  @ApiNotFoundResponse({
    description: '프로젝트를 찾을 수 없음',
  })
  @Delete(':memberId')
  remove(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
  ): Promise<void> {
    return this.projectMemberService.remove(projectId, memberId);
  }

  @ApiOperation({ summary: '프로젝트 멤버 역할 수정' })
  @ApiOkResponse({
    description: '성공',
  })
  @ApiNotFoundResponse({
    description: '프로젝트를 찾을 수 없음',
  })
  @Patch(':memberId')
  update(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Body() updateProjectMemberDto: UpdateProjectMemberDto,
  ) {
    return this.projectMemberService.update(
      projectId,
      memberId,
      updateProjectMemberDto,
    );
  }
}
