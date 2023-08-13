import { PartialType } from '@nestjs/swagger';
import { dateDto } from './create-activity.dto';

export class UpdateActivityDto extends PartialType(dateDto) {}
