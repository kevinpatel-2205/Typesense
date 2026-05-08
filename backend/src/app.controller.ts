import { Controller, Get, Post, Query, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { SearchDto } from './dto/search.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('search')
  search(@Query() dto: SearchDto) {
    return this.appService.search(dto);
  }
  @Post('sync')
  @HttpCode(200)
  sync() {
    return this.appService.syncAll();
  }
}