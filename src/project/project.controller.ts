import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectDto, ProjectSimpleDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser, type UserFromJwt } from '../common/decorators/user.decorator';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('프로젝트')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: '프로젝트 생성' })
  @ApiCreatedResponse({
    type: () => String,
    description: '성공 시 프로젝트 id 반환',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @GetUser() user: UserFromJwt,
  ) {
    return this.projectService.create(createProjectDto, user.id);
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
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
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
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
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
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.projectService.remove(id);
  }
}
