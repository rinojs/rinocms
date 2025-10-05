import { dbDir, DB_TIMEOUT } from "../../config.js";
import { dbCommandWithTimeout } from '../dbProxy.js'

export async function doesAccountExistByUsername(username)
{
    const result = await dbCommandWithTimeout(DB_TIMEOUT, "getmultiplebykeyword", dbDir, "rinocms", "account", `${ username }@@`, 0, 1);
    const dataList = result?.data ? Object.keys(result.data) : [];
    return dataList.length > 0;
}