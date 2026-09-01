import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { UserDto, UserSearchQueryDto } from './dto/user.dto';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('사용자')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '사용자 생성 (회원가입)' })
  @ApiCreatedResponse({
    type: String,
    description: '성공 시 사용자 아이디 반환',
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
  @ApiOkResponse({
    description: '성공',
    type: UserDto,
    isArray: true,
  })
  @SerializeOptions({
    type: UserDto,
    excludeExtraneousValues: true,
  })
  @Get()
  findAll(@Query() query: UserSearchQueryDto): Promise<UserDto[]> {
    return this.userService.findAll(query);
  }

  @ApiOperation({ summary: '사용자 조회' })
  @ApiOkResponse({
    description: '성공',
    type: UserDto,
  })
  @ApiNotFoundResponse({
    description: '사용자를 찾을 수 없음',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserDto> {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: '사용자 정보 수정' })
  @ApiOkResponse({
    description: '성공',
  })
  @ApiNotFoundResponse({
    description: '사용자를 찾을 수 없음',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: '사용자 삭제 (미사용)' })
  @ApiOkResponse({
    description: '성공',
  })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // TODO: 사용자 삭제 취소
}
