import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MemberRole } from '../../common/enums';

export class ProjectMemberDto {
  /**
   * 멤버 아이디
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  userId: string;

  /**
   * 멤버 이름
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * 멤버 이메일
   */
  @Expose()
  @IsOptional()
  @IsEmail()
  email?: string;

  /**
   * 멤버 역할
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  role: MemberRole;
}
