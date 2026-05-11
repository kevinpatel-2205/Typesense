import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

const CATEGORIES = ['Restaurant', 'Hotel', 'Cafe', 'Hospital', 'School', 'Store'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING'];

export class AddPlaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(CATEGORIES)
  category!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(STATUSES)
  status!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  location!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  tags!: string;
}