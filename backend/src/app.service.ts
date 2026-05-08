// // src/app.service.ts

// import { Injectable } from '@nestjs/common';
// import { TypesenseService } from './typesense/typesense.service';
// import { SyncService } from './sync/sync.service';
// import { SearchDto } from './dto/search.dto';

// @Injectable()
// export class AppService {
//   constructor(
//     private readonly typesenseService: TypesenseService,
//     private readonly syncService: SyncService,
//   ) { }

//   search(dto: SearchDto) {
//     return this.typesenseService.search(dto);
//   }

//   getFacets(filterBy?: string) {
//     return this.typesenseService.getFacets(filterBy);
//   }

//   syncAll() {
//     return this.syncService.syncAll();
//   }
// }



// src/app.service.ts

import { Injectable } from '@nestjs/common';
import { TypesenseService } from './typesense/typesense.service';
import { SyncService } from './sync/sync.service';
import { SearchDto } from './dto/search.dto';

@Injectable()
export class AppService {
  constructor(
    private readonly typesenseService: TypesenseService,
    private readonly syncService: SyncService,
  ) { }

  search(dto: SearchDto) {
    return this.typesenseService.search(dto);
  }
  syncAll() {
    return this.syncService.syncAll();
  }
}