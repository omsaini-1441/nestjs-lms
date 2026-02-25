import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { GroupVisibility } from '../entities/group.entity';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsEnum(GroupVisibility)
  visibility: GroupVisibility;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxMembers?: number;
}