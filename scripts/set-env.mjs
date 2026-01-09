import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import 'dotenv/config';

const targetPath = './public/assets/env.js';
const envConfigFile = `
  window.env = {
    SUPABASE_URL: '${process.env['SUPABASE_URL']}',
    SUPABASE_KEY: '${process.env['SUPABASE_KEY']}'
  };
`;

try {
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, envConfigFile);
  console.log(`Archivo env.js generado en ${targetPath}`);
} catch (err) {
  console.error(err);
}
