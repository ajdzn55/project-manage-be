import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({
  name: 'user_notice_check',
  comment: '사용자별 마감 임박 작업 알림 확인 정보',
})
export class UserNoticeCheck {
  @PrimaryColumn({ type: 'varchar', name: 'user_id', length: 30 })
  userId: string;

  @Column({
    type: 'date',
    name: 'last_checked_date',
    comment: '마감 임박 작업 알림 마지막 확인일자',
  })
  lastCheckedDate: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
