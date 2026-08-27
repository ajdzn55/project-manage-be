import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('app_user_email_key', ['email'], {
  unique: true,
})
@Entity({ name: 'app_user', comment: '사용자 정보' })
export class User {
  @PrimaryColumn('varchar', { length: 30, comment: '로그인 아이디' })
  id: string;

  @Column('varchar', { length: 30, comment: '이름' })
  name: string;

  @Column('varchar', { length: 50, comment: '이메일', nullable: true })
  email?: string;

  @Column('varchar', { length: 100, comment: '비밀번호', select: false })
  password: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: '생성일시',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    comment: '수정일시',
  })
  updatedAt: Date;
}
