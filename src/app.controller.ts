import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ security: [] })
  @Public()
  @Get()
  checkHealth(): Promise<boolean> {
    return this.appService.checkHealth();
  }
}
