import { Expose } from 'class-transformer';

export class UserDto {
  /**
   * id
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
