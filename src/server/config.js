import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);
export const port = process.env.PORT || 3333;
export const emailPort = process.env.EMAIL_PORT || 2525;
export const iomax = 512;
export const rootDir = "../../"
export const publicClientDir = path.join(__dirname, rootDir, "serve/public-client");
export const backofficeDir = path.join(__dirname, rootDir, 'serve/backoffice');
export const publicStorageDir = path.join(__dirname, rootDir, 'serve/public-storage');
export const logDir = path.join(__dirname, rootDir, "log");
export const dbDir = path.join(__dirname, rootDir, "data");
export const USERNAME_REGEX = /^(?=.{5,50}$)(?!.*[._-]{2})[a-z](?:[a-z0-9._-]*[a-z0-9])$/;
export const EMAIL_REGEX = /^(?=.{6,254}$)(?=.{1,64}@)[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;
export const PASSWORD_REGEX = /^(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?`~])[A-Za-z0-9!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?`~]{8,24}$/;
export const ACCESS_TTL = "1d";
export const DB_TIMEOUT = 10000;