import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable '${key}' is not defined in .env file`);
  }
  return value;
}

export const ENV = {
  BASE_URL: getEnvVariable('BASE_URL'),
  STANDARD_USER: getEnvVariable('STANDARD_USER'),
  LOCKED_OUT_USER: getEnvVariable('LOCKED_OUT_USER'),
  PASSWORD: getEnvVariable('PASSWORD'),
  API_BASE_URL: getEnvVariable('API_BASE_URL'),
  API_USERNAME: getEnvVariable('API_USERNAME'),
  API_PASSWORD: getEnvVariable('API_PASSWORD'),
};
