import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  private readonly supabase: ReturnType<typeof createClient>;

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_ANON_KEY'),
    );
  }

  async checkHealth(): Promise<boolean> {
    try {
      // TypeORM DB 직접 연결 확인
      await this.dataSource.query('SELECT 1');

      // Supabase API 경유 연결 확인
      const { data, error } = await this.supabase
        .rpc('health_check')
        .abortSignal(AbortSignal.timeout(3_000));

      if (error || data !== true) {
        throw new Error(error?.message ?? 'Unexpected health-check response');
      }

      return true;
    } catch {
      // 503 error (DB/API 의존성 장애)
      // 장애 상태 명시, 내부 Supabase 오류 메시지나 스키마 정보 노출 방지
      throw new ServiceUnavailableException('Health check failed');
    }
  }
}
