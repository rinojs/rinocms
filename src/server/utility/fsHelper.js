import path from 'path';
import fsp from "fs/promises";

export async function fileExists(filepath)
{
    try
    {
        await fsp.access(filepath);
        return true;
    }
    catch
    {
        return false;
    }
}

export async function getFilesRecursively(dir, extensions)
{
    const results = [];
    const files = await fsp.readdir(dir, { withFileTypes: true });
    for (const file of files)
    {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory())
        {
            results.push(...await getFilesRecursively(filePath, extensions));
        }
        else if (extensions.includes(path.extname(file.name)))
        {
            results.push(filePath);
        }
    }

    return results;
}