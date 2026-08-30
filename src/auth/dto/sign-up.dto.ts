import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserDto } from '../../user/dto/user.dto';

export class SignUpDto extends UserDto {
  /**
   * 비밀번호
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  password: string;
}
