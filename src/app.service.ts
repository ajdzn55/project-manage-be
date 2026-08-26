import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private dataSource: DataSource) {}

  async checkHealth() {
    await this.dataSource.query('SELECT 1');
    return true;
  }
}
