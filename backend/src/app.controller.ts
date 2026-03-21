import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return {
      message: 'Staff management API is running',
      timestamp: new Date().toISOString(),
    };
  }
}
