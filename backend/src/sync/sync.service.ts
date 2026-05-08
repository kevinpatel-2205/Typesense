import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TypesenseService } from '../typesense/typesense.service';

const BATCH = 5000;

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly prisma = new PrismaClient();

  constructor(private readonly ts: TypesenseService) { }

  async syncAll() {
    const client = this.ts.getClient();
    const t0 = Date.now();
    let offset = 0;
    let synced = 0;

    try {
      await client.collections('places').retrieve();
      this.logger.log('Collection already exists — skipping create');
    } catch {
      await client.collections().create({
        name: 'places',
        fields: [
          { name: 'mysqlId', type: 'int32' },
          { name: 'name', type: 'string', infix: true },
          { name: 'description', type: 'string', index: false, optional: true },
          { name: 'category', type: 'string', facet: true },
          { name: 'status', type: 'string', facet: true },
          { name: 'location', type: 'string', facet: true },
          { name: 'tags', type: 'string[]', facet: true },
          { name: 'createdDate', type: 'int64' },
        ],
        default_sorting_field: 'createdDate',
      });
      this.logger.log('Collection "places" created');
    }

    this.logger.log('⏳ Sync started...');

    while (true) {
      const rows = await this.prisma.place.findMany({
        skip: offset,
        take: BATCH,
        orderBy: { id: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          status: true,
          location: true,
          tags: true,
          createdDate: true,
        },
      });

      if (rows.length === 0) break;

      const docs = rows.map((r) => ({
        id: String(r.id),
        mysqlId: r.id,
        name: r.name,
        description: r.description ?? '',
        category: r.category,
        status: r.status,
        location: r.location,
        tags: (() => { try { return JSON.parse(r.tags); } catch { return [r.tags]; } })(),
        createdDate: Math.floor(new Date(r.createdDate).getTime() / 1000),
      }));

      await client.collections('places').documents().import(docs, { action: 'upsert' });

      synced += docs.length;
      offset += BATCH;

      if (synced % 100000 === 0) {
        this.logger.log(`✅ Synced ${synced.toLocaleString()}`);
      }
    }

    const timeSec = ((Date.now() - t0) / 1000).toFixed(1);
    this.logger.log(`🎉 Done — ${synced.toLocaleString()} records in ${timeSec}s`);

    return {
      success: true,
      synced,
      timeSec: Number(timeSec),
    };
  }
}

