import { dbDir, DB_TIMEOUT } from "../../config.js";
import { dbCommandWithTimeout } from '../dbProxy.js'

export async function doesAccountExist(username, email)
{
    const emailResult = await dbCommandWithTimeout(DB_TIMEOUT, "getmultiplebykeyword", dbDir, "rinocms", "account", `@@${ email }`, 0, 1);
    const emailDataList = emailResult?.data ? Object.keys(emailResult.data) : [];
    const usernameResult = await dbCommandWithTimeout(DB_TIMEOUT, "getmultiplebykeyword", dbDir, "rinocms", "account", `${ username }@@`, 0, 1);
    const usernameDataList = usernameResult?.data ? Object.keys(usernameResult.data) : [];
    return emailDataList.length > 0 || usernameDataList.length > 0;
}