import path from 'path';
import express from 'express';
import { iomax, __dirname, publicClientDir, publicStorageDir, backofficeDir, port } from "./config.js";
import { Semaphore } from './utility/semaphore.js';
import { requestLogger } from './utility/requestLogger.js';
import { securityHeaders } from './utility/securityHeaders.js';
import mainRouter from './main.js'
import { loadRoutes } from './utility/loadRoutes.js';
import { setup } from './setup.js';

await setup();

global.fileLocks = new Map();
global.ioSemaphore = new Semaphore(iomax);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger());
app.use(securityHeaders());
await loadRoutes(app, path.resolve(__dirname, '../api'));
app.use('/backoffice', express.static(backofficeDir));
await loadRoutes(app, path.resolve(__dirname, './routes'));
app.use(mainRouter);
app.use(express.static(publicClientDir));
app.use('/public-storage', express.static(publicStorageDir));

app.listen(port, () =>
{
    console.log(`Server running at http://localhost:${ port }`);
});