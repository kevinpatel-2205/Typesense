import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TypesenseService } from '../typesense/typesense.service';
import { AddPlaceDto } from '../dto/add-place.dto';

@Injectable()
export class PlaceService {
  private readonly logger = new Logger(PlaceService.name);
  private readonly prisma = new PrismaClient();

  constructor(private readonly ts: TypesenseService) { }

  async addPlace(dto: AddPlaceDto) {
    const tagsArray = dto.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const saved = await this.prisma.place.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        category: dto.category,
        status: dto.status,
        location: dto.location,
        tags: JSON.stringify(tagsArray),
        createdDate: new Date(),
      },
    });

    this.logger.log(`✅ Saved to MySQL: id=${saved.id} name="${saved.name}"`);

    const client = this.ts.getClient();

    const doc = {
      id: String(saved.id),
      mysqlId: saved.id,
      name: saved.name,
      description: saved.description ?? '',
      category: saved.category,
      status: saved.status,
      location: saved.location,
      tags: tagsArray,
      createdDate: Math.floor(new Date(saved.createdDate).getTime() / 1000),
    };

    await client.collections('places').documents().upsert(doc);

    this.logger.log(`✅ Synced to Typesense: id=${saved.id}`);

    return {
      success: true,
      data: {
        id: saved.id,
        name: saved.name,
        description: saved.description,
        category: saved.category,
        status: saved.status,
        location: saved.location,
        tags: tagsArray,
        createdDate: saved.createdDate.toISOString(),
      },
    };
  }
}