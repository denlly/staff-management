import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRecordDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  content: string;
}
