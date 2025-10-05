import { dbDir, DB_TIMEOUT } from "../../config.js";
import { dbCommandWithTimeout } from '../dbProxy.js'

export async function addAccount(username, email, data)
{
    return await dbCommandWithTimeout(DB_TIMEOUT, "add", dbDir, "rinocms", "account", `${ username }@@${ email }`, data);
}