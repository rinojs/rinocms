import { dbDir, DB_TIMEOUT } from "../../config.js";
import { dbCommandWithTimeout } from '../dbProxy.js'

export async function addAdminAccount(username, email, data)
{
    return await dbCommandWithTimeout(DB_TIMEOUT, "add", dbDir, "rinocms", "admin-account", `${ username }@@${ email }`, data);
}