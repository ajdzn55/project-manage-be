import { Expose, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserDto {
  /**
   * 사용자 아이디
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
}

export class UserSearchQueryDto {
  /**
   * 삭제 건 포함 여부
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  withDeleted?: boolean;
}
