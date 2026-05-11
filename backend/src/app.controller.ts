import { Controller, Get, Post, Query, HttpCode, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { SearchDto } from './dto/search.dto';
import { AddPlaceDto } from './dto/add-place.dto';
import { PlaceService } from './place/place.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly placeService: PlaceService
  ) { }

  @Get('search')
  search(@Query() dto: SearchDto) {
    return this.appService.search(dto);
  }
  @Post('sync')
  @HttpCode(200)
  sync() {
    return this.appService.syncAll();
  }

  @Post('places')
  @HttpCode(201)
  addPlace(@Body() dto: AddPlaceDto) {
    return this.placeService.addPlace(dto);
  }
}