import path from "path";
import { publicClientDir } from "../config.js";
import { sendHTML } from "./sendHTML.js";

export async function sendNotFound(res)
{
    const fileName = path.join(publicClientDir, '404.html');
    const ok = await sendHTML(res, fileName, 404, { notFound: true })
    if (!ok) res.status(404).type('text').send('Page Not Found');
}