import { Router } from "express";
import path from 'path';
import { sendNotFound } from "./sender/sendNotFound.js";
import { sendHTML } from './sender/sendHTML.js';
import { publicClientDir } from "./config.js";

const router = Router();

router.get(/.*/, async (req, res, next) =>
{
    const isExt = path.extname(req.path);
    const isHtml = req.path.endsWith('.html');

    if (isExt && !isHtml) return next();

    let decodedReqPath;

    try
    {
        decodedReqPath = decodeURIComponent(req.path)
    }
    catch
    {
        return await sendNotFound(res);
    }

    if (decodedReqPath.endsWith("/")) decodedReqPath += "index.html";
    else if (!path.extname(decodedReqPath)) decodedReqPath += ".html";

    decodedReqPath = decodedReqPath.startsWith("/") ? decodedReqPath.slice(1) : decodedReqPath;
    const filePath = path.join(publicClientDir, decodedReqPath);

    // Traversal guard
    if (!filePath.startsWith(publicClientDir)) return await sendNotFound(res);

    const ok = await sendHTML(res, filePath, 200, { reqPath: req.path });
    if (!ok) await sendNotFound(res);
});

export default router;