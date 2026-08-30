import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ProjectStatus } from '../../common/enums';

@Entity({ comment: '프로젝트' })
export class Project {
  @PrimaryColumn('uuid', {
    comment: '프로젝트 ID',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column({ type: 'varchar', comment: '프로젝트명', length: 100 })
  name: string;

  @Column({ type: 'text', comment: '프로젝트 설명', nullable: true })
  description?: string | null;

  @Column({
    type: 'date',
    comment: '시작일자',
    name: 'start_date',
    nullable: true,
  })
  startDate?: string | null;

  @Column({
    type: 'date',
    comment: '종료일자',
    name: 'end_date',
    nullable: true,
  })
  endDate?: string | null;

  /* 생성자 id */
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'created_by',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_project_created_by',
  })
  createdBy: User;

  @RelationId((project: Project) => project.createdBy)
  createdById: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: '생성일시',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    comment: '수정일시',
  })
  updatedAt: Date;

  @Column({
    type: 'varchar',
    comment: '프로젝트 상태',
    length: 20,
    nullable: true,
  })
  status?: ProjectStatus | null;
}
