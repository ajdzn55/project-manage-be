import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ProjectDto, ProjectSimpleDto } from './dto/project.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: '프로젝트 생성' })
  @ApiResponse({ status: 201, description: '성공 시 프로젝트 id 반환' })
  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    // TODO: DTO에서 createdById 없애고 로그인 사용자 아이디로 대체하기
    return this.projectService.create(createProjectDto);
  }

  @ApiOperation({ summary: '프로젝트 목록 조회' })
  @ApiOkResponse({
    type: ProjectSimpleDto,
    isArray: true,
    description: '성공',
  })
  @SerializeOptions({
    type: ProjectSimpleDto,
    excludeExtraneousValues: true,
  })
  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @ApiOperation({ summary: '프로젝트 상세 조회' })
  @ApiOkResponse({
    description: '성공',
    type: ProjectDto,
  })
  @ApiNotFoundResponse({
    description: '프로젝트를 찾을 수 없음',
  })
  @SerializeOptions({
    type: ProjectDto,
    excludeExtraneousValues: true,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @ApiOperation({ summary: '프로젝트 정보 수정' })
  @ApiOkResponse({
    description: '성공',
  })
  @ApiNotFoundResponse({
    description: '프로젝트를 찾을 수 없음',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  @ApiOperation({ summary: '프로젝트 삭제' })
  @ApiOkResponse({
    description: '성공',
  })
  @ApiNotFoundResponse({
    description: '프로젝트를 찾을 수 없음',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
