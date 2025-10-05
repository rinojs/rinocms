import { dbDir, DB_TIMEOUT } from "../../config.js";
import { dbCommandWithTimeout } from '../dbProxy.js'

export async function removeAccount(username, email)
{
    return await dbCommandWithTimeout(DB_TIMEOUT, "remove", dbDir, "rinocms", "account", `${ username }@@${ email }`);
}