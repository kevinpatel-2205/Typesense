import { Injectable, Logger } from '@nestjs/common';
import Typesense from 'typesense';
import { SearchDto } from '../dto/search.dto';

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
    numRetries: 0
  });

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

    const sortBy = ALLOWED_SORT_FIELDS.has(dto.sortBy ?? '')
      ? dto.sortBy!
      : 'createdDate';

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 250);

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
      const to = dateTo ? Math.floor(new Date(dateTo).getTime() / 1000) : Math.floor(Date.now() / 1000);
      filters.push(`createdDate:[${from}..${to}]`);
    }

    const hasQuery = Boolean(q?.trim());

    const numTypos = hasQuery
      ? q!.trim().length > 6 ? '2' : '1'
      : '0';
    const sortString = hasQuery
      ? `_text_match:desc,${sortBy}:${sortOrder}`
      : `${sortBy}:${sortOrder}`;

    const infixValue = hasQuery && q!.trim().length <= 6 ? 'always' : 'off';

    const t0 = Date.now();

    const result = await this.client
      .collections('places')
      .documents()
      .search({
        q: hasQuery ? q!.trim() : '*',
        query_by: hasQuery ? 'name,location,tags' : 'name',
        query_by_weights: hasQuery ? '3,2,1' : undefined,
        prefix: hasQuery ? 'true' : 'false',
        num_typos: numTypos,
        infix: infixValue,
        filter_by: filters.length ? filters.join(' && ') : undefined,
        sort_by: sortString,
        page: safePage,
        per_page: safeLimit,
        highlight_fields: highlight ? 'name,location' : 'none',
        highlight_affix_num_tokens: 4,
        highlight_start_tag: '<mark>',
        highlight_end_tag: '</mark>',
        include_fields: 'mysqlId,name,category,status,location,tags,createdDate',
        exhaustive_search: false,
        use_cache: true,
        cache_ttl: 60,
      } as any);

    const queryTimeMs = Date.now() - t0;

    return {
      meta: {
        totalRecords: result.found,
        totalPages: Math.ceil(result.found / safeLimit),
        currentPage: safePage,
        perPage: safeLimit,
        returnedCount: result.hits?.length ?? 0,
        queryTimeMs,
        typesenseTimeMs: result.search_time_ms,
      },
      data: (result.hits ?? []).map((hit: any) => ({
        id: hit.document.mysqlId,
        name: hit.document.name,
        category: hit.document.category,
        status: hit.document.status,
        location: hit.document.location,
        tags: hit.document.tags,
        createdDate: new Date(hit.document.createdDate * 1000).toISOString(),
        score: hit.text_match ?? null,
        highlights: hit.highlights?.length
          ? hit.highlights.map((h: any) => ({
            field: h.field,
            snippet: h.snippet,
          }))
          : null,
      })),
    };
  }

  getClient() {
    return this.client;
  }
}