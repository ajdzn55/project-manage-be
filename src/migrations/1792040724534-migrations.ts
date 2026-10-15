import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1792040724534 implements MigrationInterface {
  name = 'Migrations1792040724534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create or replace function public.health_check()
      returns boolean
      language sql
      stable
      security invoker
      set search_path = ''
      as $$
        select true;
      $$;

      -- 기본 공개 실행 권한 제거
      revoke execute on function public.health_check() from public;
      
      -- 인증 사용자에게는 불필요하므로 제거
      revoke execute on function public.health_check() from authenticated;
      
      -- anon key로 호출해야 하므로 함수 실행만 허용
      grant execute on function public.health_check() to anon;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop function if exists public.health_check();
    `);
  }
}
