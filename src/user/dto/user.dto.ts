import { Expose } from 'class-transformer';

export class UserDto {
  /**
   * 사용자 아이디
   */
  @Expose()
  id: string;

  /**
   * 이름
   */
  @Expose()
  name: string;

  /**
   * 이메일
   */
  @Expose()
  email?: string;
}
