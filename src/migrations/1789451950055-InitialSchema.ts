import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1789451950055 implements MigrationInterface {
    name = 'InitialSchema1789451950055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "app_user" ("id" character varying(30) NOT NULL, "name" character varying(30) NOT NULL, "email" character varying(50), "password" character varying(100) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_22a5c4a3d9b2fb8e4e73fc4ada1" PRIMARY KEY ("id")); COMMENT ON COLUMN "app_user"."id" IS '로그인 아이디'; COMMENT ON COLUMN "app_user"."name" IS '이름'; COMMENT ON COLUMN "app_user"."email" IS '이메일'; COMMENT ON COLUMN "app_user"."password" IS '비밀번호'; COMMENT ON COLUMN "app_user"."created_at" IS '생성일시'; COMMENT ON COLUMN "app_user"."updated_at" IS '수정일시'; COMMENT ON COLUMN "app_user"."deleted_at" IS '삭제일시'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "app_user_email_key" ON "app_user" ("email") `);
        await queryRunner.query(`COMMENT ON TABLE "app_user" IS '사용자 정보'`);
        await queryRunner.query(`CREATE TABLE "user_notice_check" ("user_id" character varying(30) NOT NULL, "last_checked_date" date NOT NULL, CONSTRAINT "PK_9a32179d3d83af2b037513a2371" PRIMARY KEY ("user_id")); COMMENT ON COLUMN "user_notice_check"."last_checked_date" IS '마감 임박 작업 알림 마지막 확인일자'`);
        await queryRunner.query(`COMMENT ON TABLE "user_notice_check" IS '사용자별 마감 임박 작업 알림 확인 정보'`);
        await queryRunner.query(`CREATE TABLE "project_member" ("project_id" uuid NOT NULL, "user_id" character varying(30) NOT NULL, "role" character varying(10) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0d739aa2794632a5a09276afb7a" PRIMARY KEY ("project_id", "user_id")); COMMENT ON COLUMN "project_member"."project_id" IS '프로젝트 ID'; COMMENT ON COLUMN "project_member"."user_id" IS '프로젝트 멤버 아이디'; COMMENT ON COLUMN "project_member"."role" IS '프로젝트 멤버 역할'; COMMENT ON COLUMN "project_member"."created_at" IS '생성일시'`);
        await queryRunner.query(`CREATE TABLE "project" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(100) NOT NULL, "description" text, "start_date" date, "end_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying(20) NOT NULL DEFAULT 'PLANNED', "created_by" character varying(30) NOT NULL, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id")); COMMENT ON COLUMN "project"."id" IS '프로젝트 ID'; COMMENT ON COLUMN "project"."name" IS '프로젝트명'; COMMENT ON COLUMN "project"."description" IS '프로젝트 설명'; COMMENT ON COLUMN "project"."start_date" IS '시작일자'; COMMENT ON COLUMN "project"."end_date" IS '종료일자'; COMMENT ON COLUMN "project"."created_at" IS '생성일시'; COMMENT ON COLUMN "project"."updated_at" IS '수정일시'; COMMENT ON COLUMN "project"."status" IS '프로젝트 상태'; COMMENT ON COLUMN "project"."created_by" IS '로그인 아이디'`);
        await queryRunner.query(`COMMENT ON TABLE "project" IS '프로젝트'`);
        await queryRunner.query(`CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(200) NOT NULL, "description" text, "status" character varying(20) NOT NULL DEFAULT 'TODO', "priority" character varying(20) NOT NULL DEFAULT 'LOW', "due_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "completed_at" TIMESTAMP, "background_color" character varying(7) NOT NULL, "project_id" uuid NOT NULL, "assignee_id" character varying(30), "created_by" character varying(30) NOT NULL, CONSTRAINT "chk_task_background_color" CHECK ("background_color" ~ '^#[0-9A-Fa-f]{6}$'), CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id")); COMMENT ON COLUMN "task"."id" IS '작업 ID'; COMMENT ON COLUMN "task"."name" IS '작업명'; COMMENT ON COLUMN "task"."description" IS '작업 설명'; COMMENT ON COLUMN "task"."status" IS '작업 상태'; COMMENT ON COLUMN "task"."priority" IS '우선순위'; COMMENT ON COLUMN "task"."due_date" IS '마감일자'; COMMENT ON COLUMN "task"."created_at" IS '생성일시'; COMMENT ON COLUMN "task"."updated_at" IS '수정일시'; COMMENT ON COLUMN "task"."completed_at" IS '완료일시'; COMMENT ON COLUMN "task"."background_color" IS '캘린더 표시 색상'; COMMENT ON COLUMN "task"."project_id" IS '프로젝트 ID'; COMMENT ON COLUMN "task"."assignee_id" IS '로그인 아이디'; COMMENT ON COLUMN "task"."created_by" IS '로그인 아이디'`);
        await queryRunner.query(`COMMENT ON TABLE "task" IS '작업'`);
        await queryRunner.query(`ALTER TABLE "user_notice_check" ADD CONSTRAINT "FK_9a32179d3d83af2b037513a2371" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_member" ADD CONSTRAINT "fk_project_member_project" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_member" ADD CONSTRAINT "fk_project_member_user" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "fk_project_created_by" FOREIGN KEY ("created_by") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "fk_task_project" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "fk_task_assignee" FOREIGN KEY ("assignee_id") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "fk_task_created_by" FOREIGN KEY ("created_by") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "fk_task_created_by"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "fk_task_assignee"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "fk_task_project"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "fk_project_created_by"`);
        await queryRunner.query(`ALTER TABLE "project_member" DROP CONSTRAINT "fk_project_member_user"`);
        await queryRunner.query(`ALTER TABLE "project_member" DROP CONSTRAINT "fk_project_member_project"`);
        await queryRunner.query(`ALTER TABLE "user_notice_check" DROP CONSTRAINT "FK_9a32179d3d83af2b037513a2371"`);
        await queryRunner.query(`COMMENT ON TABLE "task" IS NULL`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`COMMENT ON TABLE "project" IS NULL`);
        await queryRunner.query(`DROP TABLE "project"`);
        await queryRunner.query(`DROP TABLE "project_member"`);
        await queryRunner.query(`COMMENT ON TABLE "user_notice_check" IS NULL`);
        await queryRunner.query(`DROP TABLE "user_notice_check"`);
        await queryRunner.query(`COMMENT ON TABLE "app_user" IS NULL`);
        await queryRunner.query(`DROP INDEX "public"."app_user_email_key"`);
        await queryRunner.query(`DROP TABLE "app_user"`);
    }

}
