import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MemberRole, memberRoleDesc } from '../../common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { getEnumDescriptionString } from '../../common/utils';

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
  @ApiProperty({
    enum: MemberRole,
    description: `상태 [${getEnumDescriptionString(memberRoleDesc)}]`,
  })
  @IsEnum(MemberRole)
  role: MemberRole;
}
