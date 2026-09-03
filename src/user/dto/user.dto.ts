import { Expose, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
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
  @Transform(({ value }) => {
    const rawValue: unknown = value;

    if (rawValue === 'true') return true;
    if (rawValue === 'false') return false;

    return rawValue;
  })
  @IsBoolean()
  withDeleted?: boolean;
}

export class UserLoginDto extends UserDto {
  /**
   * 생성일시
   */
  @Expose()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
}
