import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignUpDto {
  /**
   * id
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  id: string;

  /**
   * 이름
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

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
  @IsNotEmpty()
  @IsString()
  password: string;
}
