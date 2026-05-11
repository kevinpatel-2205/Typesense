import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypesenseService } from './typesense/typesense.service';
import { SyncService } from './sync/sync.service';
import { PlaceService } from './place/place.service';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService, TypesenseService, SyncService, PlaceService],
})
export class AppModule { }