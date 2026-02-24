import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

//   @IsInt()
//   userId: number;
}
