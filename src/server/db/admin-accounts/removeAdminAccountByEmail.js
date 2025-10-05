import { dbDir, DB_TIMEOUT } from "../../config.js";
import { dbCommandWithTimeout } from '../dbProxy.js'

export async function removeAdminAccountByEmail(email)
{
    const result = await dbCommandWithTimeout(DB_TIMEOUT, "getmultiplebykeyword", dbDir, "rinocms", "admin-account", `@@${ email }`, 0, 1);
    const dataList = result?.data ? Object.keys(result.data) : [];

    if (dataList.length === 0) return false;

    const key = dataList[0];

    return await dbCommandWithTimeout(DB_TIMEOUT, "remove", dbDir, "rinocms", "admin-account", key);
}