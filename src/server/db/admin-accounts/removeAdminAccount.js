import { dbDir, DB_TIMEOUT } from "../../config.js";
import { dbCommandWithTimeout } from '../dbProxy.js'

export async function removeAdminAccount(username, email)
{
    return await dbCommandWithTimeout(DB_TIMEOUT, "remove", dbDir, "rinocms", "admin-account", `${ username }@@${ email }`);
}