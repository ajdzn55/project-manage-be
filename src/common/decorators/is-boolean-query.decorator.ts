import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export const IsBooleanQuery = () =>
  applyDecorators(
    Transform(({ value }: { value: unknown }) => {
      if (value === 'true') return true;
      if (value === 'false') return false;

      return value;
    }),
    IsBoolean(),
  );
