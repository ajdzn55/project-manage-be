import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  // InternalServerErrorException, // PERF_TEST (요청 실패 시 UI와 캐시 롤백)
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
import { GetUser, type UserFromJwt } from '../common/decorators/user.decorator';

@ApiTags('작업')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({ summary: '프로젝트 작업 생성' })
  @ApiCreatedResponse({
    type: () => String,
    description: '성공 시 작업 id 반환',
  })
  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: UserFromJwt,
  ): Promise<string> {
    return this.taskService.create(createTaskDto, user.id);
  }

  @ApiOperation({ summary: '작업 목록 조회' })
  @ApiOkResponse({ type: TaskDto, isArray: true, description: '성공' })
  @ApiBadRequestResponse({
    description: '조회 조건 중 하나는 반드시 입력해야 합니다.',
  })
  @Get()
  getTasks(
    @Query() query: TaskSearchQueryDto,
    @GetUser() user: UserFromJwt,
  ): Promise<TaskDto[]> {
    if (Object.values(query).every((v) => v === undefined)) {
      throw new BadRequestException(
        '조회 조건 중 하나는 반드시 입력해야 합니다.',
      );
    }

    return this.taskService.getTasks(query, user.id);
  }

  // PERF_TEST (성공 요청에서 즉시 UI 반영)
  // 응답 지연을 위한 헬퍼 함수
  // private sleep(ms: number) {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // }

  @ApiOperation({ summary: '프로젝트 작업 정보 수정' })
  @ApiOkResponse({ description: '성공' })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<void> {
    // PERF_TEST (성공 요청에서 즉시 UI 반영)
    // await this.sleep(1000); // 1초(1000ms) 대기

    // PERF_TEST (요청 실패 시 UI와 캐시 롤백)
    // throw new InternalServerErrorException('롤백 테스트');

    return this.taskService.update(id, updateTaskDto);
  }

  @ApiOperation({ summary: '프로젝트 작업 삭제' })
  @ApiOkResponse({ description: '성공' })
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.taskService.remove(id);
  }
}
