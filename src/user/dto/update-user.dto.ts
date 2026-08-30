import { OmitType, PartialType } from '@nestjs/swagger';
import { SignUpDto } from '../../auth/dto/sign-up.dto';

export class UpdateUserDto extends PartialType(OmitType(SignUpDto, ['id'])) {}
