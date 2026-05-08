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

  // ── Search & Facets ───────────────────────────────────────────────────────
  search(dto: SearchDto) {
    return this.typesenseService.search(dto);
  }

  getFacets(filterBy?: string) {
    return this.typesenseService.getFacets(filterBy);
  }

  // ── Sync ──────────────────────────────────────────────────────────────────
  syncAll() {
    return this.syncService.syncAll();
  }

  deleteOrphans() {
    return this.syncService.deleteOrphans();
  }

  // ── Analytics ─────────────────────────────────────────────────────────────
  getAnalytics(limit?: number) {
    return this.typesenseService.getAnalytics(limit);
  }

  // ── Synonyms ──────────────────────────────────────────────────────────────
  listSynonyms() {
    return this.typesenseService.listSynonyms();
  }

  seedDefaultSynonyms() {
    return this.typesenseService.seedDefaultSynonyms();
  }

  upsertSynonym(id: string, def: { synonyms?: string[]; root?: string }) {
    return this.typesenseService.upsertSynonym(id, def);
  }

  deleteSynonym(id: string) {
    return this.typesenseService.deleteSynonym(id);
  }
}