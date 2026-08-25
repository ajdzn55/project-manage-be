import { Expose } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  /**
   * 이름
   */
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * 이메일
   */
  @Expose()
  @IsOptional()
  @IsEmail()
  email?: string;

  /**
   * 비밀번호
   */
  @Expose()
  @IsOptional()
  @IsString()
  password?: string;
}
