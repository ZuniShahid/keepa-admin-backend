import { join } from 'path';
import envSchema from 'env-schema';
import S from 'fluent-json-schema';

const schema: any = S.object()
  .prop('API_KEY', S.string().required())
  .prop('APP_ID', S.string().required())
  .prop('LOG_LEVEL', S.string().default('info'))
  .prop('PRETTY_PRINT', S.string().default(true));

export type EnvConfig = {
  API_KEY: string;
  APP_ID: string;
  LOG_LEVEL: string;
  PRETTY_PRINT: boolean;
};

export default envSchema<EnvConfig>({
  schema,
  dotenv: { path: join(__dirname, '../.env') },
});
