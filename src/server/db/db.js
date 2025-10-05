import { CrumbDB } from 'crumbdb';
const db = new CrumbDB(512);

process.on('message', async (msg) =>
{
    const { cmd, id, args } = msg;

    try
    {
        let result;
        switch (cmd.toLowerCase())
        {
            case 'get':
                result = await db.get(...args);
                break;
            case 'add':
                result = await db.add(...args);
                break;
            case 'update':
                result = await db.update(...args);
                break;
            case 'remove':
                result = await db.remove(...args);
                break;
            case 'getall':
                result = await db.getAll(...args);
                break;
            case 'getmultiple':
                result = await db.getMultiple(...args);
                break;
            case 'getmultiplebykeyword':
                result = await db.getMultipleByKeyword(...args);
                break;
            case 'getmultiplebykeywords':
                result = await db.getMultipleByKeywords(...args);
                break;
            case 'backup':
                result = await db.backup(...args);
                break;
            case 'restore':
                result = await db.restore(...args);
                break;
            default:
                throw new Error(`Unknown command: ${ cmd }`);
        }

        process.send({ id, result });
    }
    catch (err)
    {
        process.send({ id, error: err.message });
    }
});