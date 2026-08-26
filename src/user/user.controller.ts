import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { UserDto } from './dto/user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '사용자 생성 (회원가입)' })
  @ApiResponse({
    status: 201,
    description: '성공',
    schema: { type: 'string' },
  })
  @ApiResponse({
    status: 409,
    description: '이미 사용 중인 아이디',
  })
  @Post()
  create(@Body() signUpDto: SignUpDto): Promise<string> {
    return this.userService.signUp(signUpDto);
  }

  @ApiOperation({ summary: '사용자 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: UserDto,
    isArray: true,
  })
  @SerializeOptions({
    type: UserDto,
    excludeExtraneousValues: true,
  })
  @Get()
  findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: '사용자 조회' })
  @ApiResponse({
    status: 200,
    description: '성공',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserDto> {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: '사용자 정보 수정' })
  @ApiResponse({
    status: 200,
    description: '성공',
    schema: { type: 'boolean' },
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<boolean> {
    return this.userService.update(id, updateUserDto);
  }
}
