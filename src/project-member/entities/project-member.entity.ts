import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { MemberRole } from '../../common/enums';
import { Project } from '../../project/entities/project.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'project_member' })
export class ProjectMember {
  @PrimaryColumn('uuid', { name: 'project_id', comment: '프로젝트 ID' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_project_member_project',
  })
  project: Project;

  @PrimaryColumn('varchar', {
    name: 'user_id',
    length: 30,
    comment: '프로젝트 멤버 아이디',
  })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_project_member_user',
  })
  user: User;

  @Column('varchar', { comment: '프로젝트 멤버 역할', length: 10 })
  role: MemberRole;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: '생성일시',
  })
  createdAt: Date;
}
