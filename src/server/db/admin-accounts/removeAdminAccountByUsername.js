import { dbDir, DB_TIMEOUT } from "../../config.js";
import { dbCommandWithTimeout } from '../dbProxy.js'

export async function removeAdminAccountByUsername(username)
{
    const result = await dbCommandWithTimeout(DB_TIMEOUT, "getmultiplebykeyword", dbDir, "rinocms", "admin-account", `${ username }@@`, 0, 1);
    const dataList = result?.data ? Object.keys(result.data) : [];

    if (dataList.length === 0) return false;

    const key = dataList[0];

    return await dbCommandWithTimeout(DB_TIMEOUT, "remove", dbDir, "rinocms", "admin-account", key);
}