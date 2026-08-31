import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { User } from '../../user/entities/user.entity';
import { TaskPriority, TaskStatus } from '../../common/enums';

@Check('chk_task_background_color', `"background_color" ~ '^#[0-9A-Fa-f]{6}$'`)
@Entity({ comment: '작업' })
export class Task {
  @PrimaryColumn('uuid', {
    comment: '작업 ID',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  /* 프로젝트 id */
  @ManyToOne(() => Project, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_task_project',
  })
  project: Project;

  @RelationId((task: Task) => task.project)
  projectId: string;

  @Column('varchar', { comment: '작업명', length: 200 })
  name: string;

  @Column('text', { comment: '작업 설명', nullable: true })
  description?: string;

  @Column('varchar', { comment: '작업 상태', nullable: true, length: 20 })
  status?: TaskStatus | null;

  @Column('varchar', { comment: '우선순위', nullable: true, length: 20 })
  priority?: TaskPriority | null;

  /* 담당자 */
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'assignee_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_task_assignee',
  })
  assignee?: User | null;

  @RelationId((task: Task) => task.assignee)
  assigneeId?: string | null;

  @Column('date', { name: 'due_date', comment: '마감일자', nullable: true })
  dueDate?: string;

  /* 생성자 id */
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'created_by',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_task_created_by',
  })
  createdBy: User;

  @RelationId((task: Task) => task.createdBy)
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

  @Column('varchar', {
    name: 'background_color',
    comment: '캘린더 표시 색상',
    length: 7,
    default: '#FFFFFF',
  })
  backgroundColor?: string;
}
