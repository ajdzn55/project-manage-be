import { PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { UserDto } from '../../user/dto/user.dto';

export class LoginRequestDto extends PickType(UserDto, ['id']) {
  /**
   * 사용자 비밀번호
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginInfoDto extends UserDto {
  /**
   * 생성일시
   */
  @Expose()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
}
