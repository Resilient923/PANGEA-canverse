import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller({ path: `/` })
@ApiTags('App')
export class AppController {
  @ApiOperation({ summary: 'Health check.' })
  @Get(`/health`)
  async HealthCheck(): Promise<{ status: string }> {
    return { status: 'ok' };
  }
}
