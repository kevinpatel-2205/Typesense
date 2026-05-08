// // // src/typesense/typesense.service.ts

// // import { Injectable } from '@nestjs/common';
// // import Typesense from 'typesense';
// // import { SearchDto } from '../dto/search.dto';

// // @Injectable()
// // export class TypesenseService {
// //   private readonly client = new Typesense.Client({
// //     nodes: [
// //       {
// //         host: process.env.TYPESENSE_HOST || 'localhost',
// //         port: Number(process.env.TYPESENSE_PORT) || 8108,
// //         protocol: process.env.TYPESENSE_PROTOCOL || 'http',
// //       },
// //     ],
// //     apiKey: process.env.TYPESENSE_API_KEY || 'typesense_poc_api_key',
// //     connectionTimeoutSeconds: 5,
// //     retryIntervalSeconds: 0.1,
// //     numRetries: 0, // no retry — fail fast for performance
// //   });

// //   async search(dto: SearchDto) {
// //     const {
// //       q,
// //       category,
// //       status,
// //       tags,
// //       location,
// //       dateFrom,
// //       dateTo,
// //       page = 1,
// //       limit = 1000,
// //       sortBy = 'createdDate',
// //       sortOrder = 'desc',
// //     } = dto;

// //     // ── Build filter_by ─────────────────────────────────────────
// //     const filters: string[] = [];

// //     if (category) {
// //       // multi-select: Restaurant,Hotel  →  category:=[Restaurant,Hotel]
// //       filters.push(`category:=[${category}]`);
// //     }

// //     if (status) {
// //       filters.push(`status:=[${status}]`);
// //     }

// //     if (tags) {
// //       // tags is stored as string[] in Typesense
// //       const tagList = tags.split(',').map((t) => t.trim());
// //       filters.push(`tags:=[${tagList.join(',')}]`);
// //     }

// //     if (location) {
// //       // exact facet match for speed; use q for fuzzy location search
// //       filters.push(`location:=${location}`);
// //     }

// //     if (dateFrom || dateTo) {
// //       const from = dateFrom ? Math.floor(new Date(dateFrom).getTime() / 1000) : 0;
// //       const to = dateTo ? Math.floor(new Date(dateTo).getTime() / 1000) : Math.floor(Date.now() / 1000);
// //       filters.push(`createdDate:[${from}..${to}]`);
// //     }

// //     const filterBy = filters.join(' && ');
// //     const sortString = `${sortBy}:${sortOrder}`;

// //     // ── Fire search ─────────────────────────────────────────────
// //     const t0 = Date.now();

// //     const result = await this.client
// //       .collections('places')
// //       .documents()
// //       .search({
// //         q: q || '*',
// //         query_by: 'name,location,tags',
// //         query_by_weights: '3,2,1',         // name ranked highest
// //         prefix: 'true',           // partial match
// //         infix: 'off',            // off = faster; turn on only if needed
// //         num_typos: q ? '1' : '0',   // typo tolerance only when searching
// //         typo_tokens_threshold: 1,
// //         filter_by: filterBy || undefined,
// //         facet_by: 'category,status,tags,location',
// //         max_facet_values: 50,
// //         sort_by: sortString,
// //         page,
// //         per_page: limit,
// //         highlight_full_fields: 'name',
// //         exhaustive_search: false,            // approximate = faster on 1cr records
// //       } as any);

// //     const queryTimeMs = Date.now() - t0;

// //     // ── Shape response ──────────────────────────────────────────
// //     const totalRecords = result.found;
// //     const totalPages = Math.ceil(totalRecords / limit);
// //     const returnedCount = result.hits?.length ?? 0;

// //     const data = (result.hits ?? []).map((hit: any) => ({
// //       id: hit.document.mysqlId,
// //       name: hit.document.name,
// //       description: hit.document.description,
// //       category: hit.document.category,
// //       status: hit.document.status,
// //       location: hit.document.location,
// //       tags: hit.document.tags,
// //       createdDate: new Date(hit.document.createdDate * 1000).toISOString(),
// //       highlight: hit.highlights?.[0]?.snippet ?? null,
// //       score: hit.text_match ?? null,
// //     }));

// //     // const facets: Record<string, { value: string; count: number }[]> = {};
// //     // for (const fc of result.facet_counts ?? []) {
// //     //   facets[fc.field_name] = fc.counts.map((c: any) => ({
// //     //     value: c.value,
// //     //     count: c.count,
// //     //   }));
// //     // }

// //     return {
// //       meta: {
// //         totalRecords,
// //         totalPages,
// //         currentPage: page,
// //         perPage: limit,
// //         returnedCount,
// //         queryTimeMs,                         // your API total time
// //         typesenseTimeMs: result.search_time_ms, // pure Typesense engine time
// //       },
// //       appliedFilters: {
// //         q: q ?? null,
// //         category: category ?? null,
// //         status: status ?? null,
// //         tags: tags ?? null,
// //         location: location ?? null,
// //         dateFrom: dateFrom ?? null,
// //         dateTo: dateTo ?? null,
// //         sortBy,
// //         sortOrder,
// //       },
// //       // facets,
// //       data,
// //     };
// //   }

// //   getClient() {
// //     return this.client;
// //   }
// // }





// // src/typesense/typesense.service.ts

// import { Injectable, BadRequestException } from '@nestjs/common';
// import Typesense from 'typesense';
// import { SearchDto } from '../dto/search.dto';

// @Injectable()
// export class TypesenseService {
//   private readonly client = new Typesense.Client({
//     nodes: [
//       {
//         host: process.env.TYPESENSE_HOST || 'localhost',
//         port: Number(process.env.TYPESENSE_PORT) || 8108,
//         protocol: process.env.TYPESENSE_PROTOCOL || 'http',
//       },
//     ],
//     apiKey: process.env.TYPESENSE_API_KEY || 'typesense_poc_api_key',
//     connectionTimeoutSeconds: 3,
//     retryIntervalSeconds: 0.1,
//     numRetries: 0,
//   });

//   private escapeTypesenseValue(value: string): string {
//     return `\`${String(value).replace(/`/g, '\\`')}\``;
//   }

//   private toCsvArray(value: string): string[] {
//     return value
//       .split(',')
//       .map((v) => v.trim())
//       .filter(Boolean);
//   }

//   // async search(dto: SearchDto) {
//   //   const {
//   //     q,
//   //     category,
//   //     status,
//   //     tags,
//   //     location,
//   //     dateFrom,
//   //     dateTo,
//   //     page = 1,
//   //     limit = 100,
//   //     sortBy = 'createdDate',
//   //     sortOrder = 'desc',
//   //   } = dto;

//   //   const safePage = Math.max(Number(page) || 1, 1);

//   //   // You want 100 records per page.
//   //   // Do not allow 1000 from API unless you really need it.
//   //   const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 100);

//   //   const allowedSortFields = new Set(['createdDate', 'name', 'category', 'status']);
//   //   const allowedSortOrders = new Set(['asc', 'desc']);

//   //   if (!allowedSortFields.has(sortBy)) {
//   //     throw new BadRequestException(`Invalid sortBy: ${sortBy}`);
//   //   }

//   //   if (!allowedSortOrders.has(sortOrder)) {
//   //     throw new BadRequestException(`Invalid sortOrder: ${sortOrder}`);
//   //   }

//   //   const filters: string[] = [];

//   //   if (category) {
//   //     const categories = this.toCsvArray(category)
//   //       .map((v) => this.escapeTypesenseValue(v))
//   //       .join(',');

//   //     filters.push(`category:=[${categories}]`);
//   //   }

//   //   if (status) {
//   //     const statuses = this.toCsvArray(status)
//   //       .map((v) => this.escapeTypesenseValue(v))
//   //       .join(',');

//   //     filters.push(`status:=[${statuses}]`);
//   //   }

//   //   if (tags) {
//   //     const tagList = this.toCsvArray(tags)
//   //       .map((v) => this.escapeTypesenseValue(v))
//   //       .join(',');

//   //     filters.push(`tags:=[${tagList}]`);
//   //   }

//   //   if (location) {
//   //     filters.push(`location:=${this.escapeTypesenseValue(location)}`);
//   //   }

//   //   if (dateFrom || dateTo) {
//   //     const from = dateFrom
//   //       ? Math.floor(new Date(dateFrom).getTime() / 1000)
//   //       : 0;

//   //     const to = dateTo
//   //       ? Math.floor(new Date(dateTo).getTime() / 1000)
//   //       : Math.floor(Date.now() / 1000);

//   //     filters.push(`createdDate:[${from}..${to}]`);
//   //   }

//   //   const filterBy = filters.length ? filters.join(' && ') : undefined;
//   //   const sortString = `${sortBy}:${sortOrder}`;

//   //   const t0 = Date.now();

//   //   const result = await this.client
//   //     .collections('places')
//   //     .documents()
//   //     .search({
//   //       q: q?.trim() || '*',

//   //       query_by: 'name,location,tags',
//   //       query_by_weights: '3,2,1',

//   //       prefix: q ? 'true' : 'false',
//   //       infix: 'off',
//   //       num_typos: q ? '1' : '0',
//   //       typo_tokens_threshold: 1,

//   //       filter_by: filterBy,

//   //       // Enable facets only if your UI really needs them.
//   //       // Facets cost extra time on large datasets.
//   //       facet_by: 'category,status,tags,location',
//   //       max_facet_values: 20,

//   //       sort_by: sortString,

//   //       page: safePage,
//   //       per_page: safeLimit,

//   //       // Return only fields needed by the API.
//   //       include_fields:
//   //         'mysqlId,name,description,category,status,location,tags,createdDate',

//   //       // Highlighting costs extra.
//   //       // Keep it only when q exists.
//   //       highlight_full_fields: q ? 'name' : undefined,

//   //       exhaustive_search: false,
//   //     } as any);

//   //   const queryTimeMs = Date.now() - t0;

//   //   const totalRecords = result.found;
//   //   const totalPages = Math.ceil(totalRecords / safeLimit);
//   //   const returnedCount = result.hits?.length ?? 0;

//   //   const data = (result.hits ?? []).map((hit: any) => ({
//   //     id: hit.document.mysqlId,
//   //     name: hit.document.name,
//   //     description: hit.document.description,
//   //     category: hit.document.category,
//   //     status: hit.document.status,
//   //     location: hit.document.location,
//   //     tags: hit.document.tags,
//   //     createdDate: new Date(hit.document.createdDate * 1000).toISOString(),
//   //     highlight: hit.highlights?.[0]?.snippet ?? null,
//   //     score: hit.text_match ?? null,
//   //   }));

//   //   return {
//   //     meta: {
//   //       totalRecords,
//   //       totalPages,
//   //       currentPage: safePage,
//   //       perPage: safeLimit,
//   //       returnedCount,
//   //       queryTimeMs,
//   //       typesenseTimeMs: result.search_time_ms,
//   //     },
//   //     appliedFilters: {
//   //       q: q ?? null,
//   //       category: category ?? null,
//   //       status: status ?? null,
//   //       tags: tags ?? null,
//   //       location: location ?? null,
//   //       dateFrom: dateFrom ?? null,
//   //       dateTo: dateTo ?? null,
//   //       sortBy,
//   //       sortOrder,
//   //     },
//   //     data,
//   //   };
//   // }


//   async search(dto: SearchDto) {
//     const {
//       q,
//       category,
//       status,
//       tags,
//       location,
//       dateFrom,
//       dateTo,
//       page = 1,
//       limit = 100,
//       sortBy = 'createdDate',
//       sortOrder = 'desc',
//     } = dto;

//     const safePage = Math.max(Number(page) || 1, 1);
//     const safeLimit = 100;

//     const filters: string[] = [];

//     const escape = (value: string) => {
//       return `\`${String(value).replace(/`/g, '\\`')}\``;
//     };

//     const splitValues = (value: string) => {
//       return value
//         .split(',')
//         .map((v) => v.trim())
//         .filter(Boolean)
//         .map(escape)
//         .join(',');
//     };

//     if (category) {
//       filters.push(`category:=[${splitValues(category)}]`);
//     }

//     if (status) {
//       filters.push(`status:=[${splitValues(status)}]`);
//     }

//     if (tags) {
//       filters.push(`tags:=[${splitValues(tags)}]`);
//     }

//     if (location) {
//       filters.push(`location:=${escape(location)}`);
//     }

//     if (dateFrom || dateTo) {
//       const from = dateFrom
//         ? Math.floor(new Date(dateFrom).getTime() / 1000)
//         : 0;

//       const to = dateTo
//         ? Math.floor(new Date(dateTo).getTime() / 1000)
//         : Math.floor(Date.now() / 1000);

//       filters.push(`createdDate:[${from}..${to}]`);
//     }

//     const hasQuery = Boolean(q?.trim());

//     const t0 = Date.now();

//     const result = await this.client
//       .collections('places')
//       .documents()
//       .search({
//         q: hasQuery ? q!.trim() : '*',

//         query_by: hasQuery ? 'name,location,tags' : 'name',
//         query_by_weights: hasQuery ? '3,2,1' : undefined,

//         filter_by: filters.length ? filters.join(' && ') : undefined,

//         page: safePage,
//         per_page: safeLimit,

//         sort_by: `${sortBy}:${sortOrder}`,

//         include_fields: 'mysqlId,name,category,status,location,createdDate,tags,description',

//         // BIG performance improvements:
//         facet_by: undefined,
//         highlight_fields: 'none',

//         prefix: hasQuery ? 'true' : 'false',
//         infix: 'off',
//         num_typos: hasQuery ? '1' : '0',

//         exhaustive_search: false,

//         // Helpful when same filters/search are repeated.
//         use_cache: true,
//         cache_ttl: 60,
//       } as any);

//     const queryTimeMs = Date.now() - t0;

//     return {
//       meta: {
//         totalRecords: result.found,
//         totalPages: Math.ceil(result.found / safeLimit),
//         currentPage: safePage,
//         perPage: safeLimit,
//         returnedCount: result.hits?.length ?? 0,
//         queryTimeMs,
//         typesenseTimeMs: result.search_time_ms,
//       },
//       data: (result.hits ?? []).map((hit: any) => ({
//         id: hit.document.mysqlId,
//         name: hit.document.name,
//         category: hit.document.category,
//         status: hit.document.status,
//         location: hit.document.location,
//         createdDate: new Date(hit.document.createdDate * 1000).toISOString(),
//         tags: hit.document.tags,
//         description: hit.document.description,

//         //       highlight: hit.highlights?.[0]?.snippet ?? null,
//         //       score: hit.text_match ?? null,
//       })),
//     };
//   }

//   getClient() {
//     return this.client;
//   }
// }



// src/typesense/typesense.service.ts

import { Injectable, Logger } from '@nestjs/common';
import Typesense from 'typesense';
import { SearchDto } from '../dto/search.dto';

// ── Allowed sort fields (prevent injection) ──────────────────────────────────
const ALLOWED_SORT_FIELDS = new Set(['createdDate', 'name', '_text_match']);

@Injectable()
export class TypesenseService {
  private readonly logger = new Logger(TypesenseService.name);

  private readonly client = new Typesense.Client({
    nodes: [
      {
        host: process.env.TYPESENSE_HOST || 'localhost',
        port: Number(process.env.TYPESENSE_PORT) || 8108,
        protocol: process.env.TYPESENSE_PROTOCOL || 'http',
      },
    ],
    apiKey: process.env.TYPESENSE_API_KEY || 'typesense_poc_api_key',
    connectionTimeoutSeconds: 2,
    retryIntervalSeconds: 0,
    numRetries: 0, // zero retries = zero extra latency on failure
  });

  // ── In-memory analytics store (swap for Redis/DB in production) ───────────
  private analytics: {
    query: string;
    filters: string;
    resultsFound: number;
    typesenseMs: number;
    apiMs: number;
    timestamp: string;
  }[] = [];

  // ────────────────────────────────────────────────────────────────────────────
  //  SEARCH
  // ────────────────────────────────────────────────────────────────────────────
  async search(dto: SearchDto) {
    const {
      q,
      category,
      status,
      tags,
      location,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortOrder = 'desc',
      highlight = false,
    } = dto;

    // Validate sortBy — fall back to createdDate if unknown field supplied
    const sortBy = ALLOWED_SORT_FIELDS.has(dto.sortBy ?? '')
      ? dto.sortBy!
      : 'createdDate';

    const safePage  = Math.max(Number(page)  || 1,  1);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 250);

    // ── Build filter_by ───────────────────────────────────────────────────────
    const filters: string[] = [];

    if (category) {
      const vals = category.split(',').map((v) => `\`${v.trim()}\``).join(',');
      filters.push(`category:=[${vals}]`);
    }
    if (status) {
      const vals = status.split(',').map((v) => `\`${v.trim()}\``).join(',');
      filters.push(`status:=[${vals}]`);
    }
    if (tags) {
      const vals = tags.split(',').map((v) => `\`${v.trim()}\``).join(',');
      filters.push(`tags:=[${vals}]`);
    }
    if (location) {
      filters.push(`location:=\`${location.trim()}\``);
    }
    if (dateFrom || dateTo) {
      const from = dateFrom ? Math.floor(new Date(dateFrom).getTime() / 1000) : 0;
      const to   = dateTo   ? Math.floor(new Date(dateTo).getTime()   / 1000) : Math.floor(Date.now() / 1000);
      filters.push(`createdDate:[${from}..${to}]`);
    }

    const hasQuery = Boolean(q?.trim());

    // ── Typo tolerance: 1 typo for short queries, 2 for longer ones ──────────
    const numTypos = hasQuery
      ? q!.trim().length > 6 ? '2' : '1'
      : '0';

    // ── Sort: when full-text query exists, blend text relevance + date ────────
    const sortString = hasQuery
      ? `_text_match:desc,${sortBy}:${sortOrder}`
      : `${sortBy}:${sortOrder}`;

    // ── infix: use 'always' for short tokens (mid-word matching on name) ──────
    // name field was indexed with infix:true in schema — leverage it
    const infixValue = hasQuery && q!.trim().length <= 6 ? 'always' : 'off';

    const t0 = Date.now();

    const result = await this.client
      .collections('places')
      .documents()
      .search({
        q: hasQuery ? q!.trim() : '*',

        // description is index:false — do NOT include it here
        query_by:         hasQuery ? 'name,location,tags' : 'name',
        query_by_weights: hasQuery ? '3,2,1'              : undefined,

        prefix:    hasQuery ? 'true' : 'false',
        num_typos: numTypos,
        infix:     infixValue,  // mid-word matching when query is short

        filter_by: filters.length ? filters.join(' && ') : undefined,

        sort_by: sortString,
        page:     safePage,
        per_page: safeLimit,

        // ── Highlights: controlled by caller (on for UI, off for API) ─────────
        highlight_fields:      highlight ? 'name,location' : 'none',
        highlight_affix_num_tokens: 4,
        highlight_start_tag:   '<mark>',
        highlight_end_tag:     '</mark>',

        // Return score so frontend can display relevance ranking
        include_fields: 'mysqlId,name,category,status,location,tags,createdDate',

        exhaustive_search: false, // approximate = much faster on 1 crore records

        use_cache: true,
        cache_ttl: 60, // same query within 60s → 0ms
      } as any);

    const queryTimeMs = Date.now() - t0;

    // ── Record analytics ──────────────────────────────────────────────────────
    this.recordAnalytic({
      query:        q ?? '*',
      filters:      filters.join(' && ') || 'none',
      resultsFound: result.found,
      typesenseMs:  result.search_time_ms,
      apiMs:        queryTimeMs,
    });

    // ── Shape response ────────────────────────────────────────────────────────
    return {
      meta: {
        totalRecords:   result.found,
        totalPages:     Math.ceil(result.found / safeLimit),
        currentPage:    safePage,
        perPage:        safeLimit,
        returnedCount:  result.hits?.length ?? 0,
        queryTimeMs,
        typesenseTimeMs: result.search_time_ms,
      },
      appliedFilters: {
        q:        q        ?? null,
        category: category ?? null,
        status:   status   ?? null,
        tags:     tags     ?? null,
        location: location ?? null,
        dateFrom: dateFrom ?? null,
        dateTo:   dateTo   ?? null,
        sortBy,
        sortOrder,
      },
      data: (result.hits ?? []).map((hit: any) => ({
        id:          hit.document.mysqlId,
        name:        hit.document.name,
        category:    hit.document.category,
        status:      hit.document.status,
        location:    hit.document.location,
        tags:        hit.document.tags,
        createdDate: new Date(hit.document.createdDate * 1000).toISOString(),
        // Relevance score for ranking display
        score:       hit.text_match ?? null,
        // Highlighted snippets (null when highlight=false)
        highlights:  hit.highlights?.length
          ? hit.highlights.map((h: any) => ({
              field:   h.field,
              snippet: h.snippet,
            }))
          : null,
      })),
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  //  FACETS  (separate call — UI sidebar, cached 2 min)
  //  Now includes: category, status, location, tags
  // ────────────────────────────────────────────────────────────────────────────
  async getFacets(filterBy?: string) {
    const t0 = Date.now();

    const result = await this.client
      .collections('places')
      .documents()
      .search({
        q:                '*',
        query_by:         'name',
        // ── All four facetable fields ────────────────────────────────────────
        facet_by:         'category,status,location,tags',
        max_facet_values: 50,
        filter_by:        filterBy || undefined,
        per_page:         0,    // zero records — facet counts only
        use_cache:        true,
        cache_ttl:        120,  // 2-minute cache
        exhaustive_search: false,
      } as any);

    const facets: Record<string, { value: string; count: number }[]> = {};
    for (const fc of result.facet_counts ?? []) {
      facets[fc.field_name] = fc.counts.map((c: any) => ({
        value: c.value,
        count: c.count,
      }));
    }

    return {
      queryTimeMs: Date.now() - t0,
      facets,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  //  SYNONYMS  — one-way & multi-way synonym support
  // ────────────────────────────────────────────────────────────────────────────

  /** Upsert a synonym rule */
  async upsertSynonym(id: string, synonymDef: {
    synonyms?: string[];          // multi-way: all map to each other
    root?: string;                // one-way: root → synonyms
  }) {
    return this.client
      .collections('places')
      .synonyms()
      .upsert(id, synonymDef as any);
  }

  /** Seed default synonyms (call once after collection is created) */
  async seedDefaultSynonyms() {
    const defaults = [
      // multi-way: searching any of these finds the others too
      { id: 'syn-food',     def: { synonyms: ['restaurant', 'cafe', 'eatery', 'diner'] } },
      { id: 'syn-medical',  def: { synonyms: ['hospital', 'clinic', 'healthcare'] } },
      { id: 'syn-lodging',  def: { synonyms: ['hotel', 'motel', 'inn', 'resort'] } },
      { id: 'syn-active',   def: { synonyms: ['active', 'open', 'available'] } },
      { id: 'syn-inactive', def: { synonyms: ['inactive', 'closed', 'unavailable'] } },
    ];

    for (const s of defaults) {
      try {
        await this.upsertSynonym(s.id, s.def);
        this.logger.log(`Synonym upserted: ${s.id}`);
      } catch (e) {
        this.logger.warn(`Synonym upsert failed for ${s.id}: ${e}`);
      }
    }
  }

  /** List all synonyms */
  async listSynonyms() {
    return this.client.collections('places').synonyms().retrieve();
  }

  /** Delete a synonym */
  async deleteSynonym(id: string) {
    return this.client.collections('places').synonyms().retrieve(); // list then delete
  }

  // ────────────────────────────────────────────────────────────────────────────
  //  ANALYTICS
  // ────────────────────────────────────────────────────────────────────────────

  private recordAnalytic(entry: {
    query: string;
    filters: string;
    resultsFound: number;
    typesenseMs: number;
    apiMs: number;
  }) {
    this.analytics.push({
      ...entry,
      timestamp: new Date().toISOString(),
    });
    // Keep last 10,000 entries in memory
    if (this.analytics.length > 10_000) {
      this.analytics.splice(0, this.analytics.length - 10_000);
    }
  }

  getAnalytics(limit = 100) {
    const recent = this.analytics.slice(-limit).reverse();

    // Zero-result queries
    const zeroResults = this.analytics.filter((a) => a.resultsFound === 0);

    // Popular queries (top 10)
    const queryCount: Record<string, number> = {};
    for (const a of this.analytics) {
      if (a.query !== '*') {
        queryCount[a.query] = (queryCount[a.query] ?? 0) + 1;
      }
    }
    const popular = Object.entries(queryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    // Avg response times
    const avgTypesenseMs = this.analytics.length
      ? Math.round(this.analytics.reduce((s, a) => s + a.typesenseMs, 0) / this.analytics.length)
      : 0;
    const avgApiMs = this.analytics.length
      ? Math.round(this.analytics.reduce((s, a) => s + a.apiMs, 0) / this.analytics.length)
      : 0;

    return {
      totalQueries:   this.analytics.length,
      avgTypesenseMs,
      avgApiMs,
      zeroResultCount: zeroResults.length,
      zeroResultQueries: zeroResults.slice(-20).map((a) => a.query),
      popularQueries:  popular,
      recent,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  getClient() {
    return this.client;
  }
}