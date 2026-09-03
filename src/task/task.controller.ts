import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskDto, TaskSearchQueryDto } from './dto/task.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('작업')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({ summary: '프로젝트 작업 생성' })
  @ApiCreatedResponse({ type: String, description: '성공 시 작업 id 반환' })
  @Post()
  create(@Body() createTaskDto: CreateTaskDto): Promise<string> {
    return this.taskService.create(createTaskDto);
  }

  @ApiOperation({ summary: '작업 목록 조회' })
  @ApiOkResponse({ type: TaskDto, isArray: true, description: '성공' })
  @ApiBadRequestResponse({
    description: '조회 조건 중 하나는 반드시 입력해야 합니다.',
  })
  @Get()
  getTasks(@Query() query: TaskSearchQueryDto): Promise<TaskDto[]> {
    if (Object.values(query).every((v) => v === undefined)) {
      throw new BadRequestException(
        '조회 조건 중 하나는 반드시 입력해야 합니다.',
      );
    }

    return this.taskService.getTasks(query);
  }

  @ApiOperation({ summary: '프로젝트 작업 정보 수정' })
  @ApiOkResponse({ description: '성공' })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<void> {
    return this.taskService.update(id, updateTaskDto);
  }

  @ApiOperation({ summary: '프로젝트 작업 삭제' })
  @ApiOkResponse({ description: '성공' })
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.taskService.remove(id);
  }
}
