import { IsNumber, IsString } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsNumber()
  distance: number;

  @IsNumber()
  duration: number;

  @IsNumber()
  originLat: number;

  @IsNumber()
  originLng: number;

  @IsNumber()
  destLat: number;

  @IsNumber()
  destLng: number;
}
