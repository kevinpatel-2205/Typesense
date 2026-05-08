import {
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
  IsBoolean,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  category?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  status?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  tags?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  location?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(250)
  limit?: number = 20;

  @IsOptional()
  @IsIn(['createdDate', 'name', '_text_match'])
  sortBy?: string = 'createdDate';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  highlight?: boolean = false;
}