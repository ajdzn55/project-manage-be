import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { MemberRole } from '../../common/enums';

export class ProjectMemberDto {
  /**
   * 프로젝트 ID
   */
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  /**
   * 멤버 아이디
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  userId: string;

  /**
   * 멤버 역할
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  role: MemberRole;
}
