// // src/app.controller.ts

// import { Controller, Get, Post, Query, HttpCode } from '@nestjs/common';
// import { AppService } from './app.service';
// import { SearchDto } from './dto/search.dto';

// @Controller()
// export class AppController {
//   constructor(private readonly appService: AppService) { }

//   // ── Main search — target < 3ms ───────────────────────────────
//   @Get('search')
//   search(@Query() dto: SearchDto) {
//     return this.appService.search(dto);
//   }

//   // ── Facets only — call once on page load for filter sidebar ──
//   // GET /facets?category=Hotel&status=ACTIVE  (filters are optional)
//   @Get('facets')
//   facets(@Query('filterBy') filterBy?: string) {
//     return this.appService.getFacets(filterBy);
//   }

//   // ── Sync MySQL → Typesense (run once) ────────────────────────
//   @Post('sync')
//   @HttpCode(200)
//   sync() {
//     return this.appService.syncAll();
//   }
// }


// src/app.controller.ts

import { Controller, Get, Post, Delete, Query, Body, Param, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { SearchDto }  from './dto/search.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ── Search — target < 5ms typesense, < 20ms API ──────────────────────────
  // GET /search?q=cafe&category=Restaurant,Hotel&status=ACTIVE&highlight=true
  @Get('search')
  search(@Query() dto: SearchDto) {
    return this.appService.search(dto);
  }

  // ── Facets — call once on page load for filter sidebar ───────────────────
  // GET /facets
  // GET /facets?filterBy=category%3A%3D%60Hotel%60
  @Get('facets')
  facets(@Query('filterBy') filterBy?: string) {
    return this.appService.getFacets(filterBy);
  }

  // ── Sync MySQL → Typesense ────────────────────────────────────────────────
  @Post('sync')
  @HttpCode(200)
  sync() {
    return this.appService.syncAll();
  }

  // ── Remove Typesense docs whose MySQL rows were deleted ───────────────────
  @Post('sync/cleanup')
  @HttpCode(200)
  cleanupOrphans() {
    return this.appService.deleteOrphans();
  }

  // ── Analytics ────────────────────────────────────────────────────────────
  // GET /analytics           → last 100 queries + aggregates
  // GET /analytics?limit=500 → last 500
  @Get('analytics')
  analytics(@Query('limit') limit?: string) {
    return this.appService.getAnalytics(limit ? Number(limit) : 100);
  }

  // ── Synonyms ─────────────────────────────────────────────────────────────
  // GET  /synonyms                  → list all
  // POST /synonyms                  → upsert   body: { id, synonyms?, root? }
  // POST /synonyms/seed             → seed defaults (restaurant=cafe etc)
  // DELETE /synonyms/:id            → remove one

  @Get('synonyms')
  listSynonyms() {
    return this.appService.listSynonyms();
  }

  @Post('synonyms/seed')
  @HttpCode(200)
  seedSynonyms() {
    return this.appService.seedDefaultSynonyms();
  }

  @Post('synonyms')
  @HttpCode(200)
  upsertSynonym(
    @Body() body: { id: string; synonyms?: string[]; root?: string },
  ) {
    return this.appService.upsertSynonym(body.id, {
      synonyms: body.synonyms,
      root:     body.root,
    });
  }

  @Delete('synonyms/:id')
  deleteSynonym(@Param('id') id: string) {
    return this.appService.deleteSynonym(id);
  }
}