import path from 'path';
import { pathToFileURL } from "url";
import { getFilesRecursively } from './fsHelper.js';


export async function loadRoutes(app, routesDir)
{
    const routeFiles = await getFilesRecursively(routesDir, ['.js']);
    const skipRegex = /^[._]/;

    for (const file of routeFiles)
    {
        const basename = path.basename(file);
        if (skipRegex.test(basename)) continue;

        try
        {

            const url = pathToFileURL(file).href;
            const routeModule = await import(url);
            const router = routeModule.default || routeModule.router;

            if (typeof router === 'function')
            {
                const mountPath = routeModule.path || '/';
                app.use(mountPath, router);
            }
        }
        catch (err)
        {
            console.error(`Failed to load route ${ file }:`, err);
        }
    }
}