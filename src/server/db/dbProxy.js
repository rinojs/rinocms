import path from 'path';
import { fork } from 'child_process';
import { __dirname } from '../config.js';

const child = fork(path.join(__dirname, `../server/db/db.js`));

const pendingMap = new Map();
let idCounter = 0;
let lastTimestamp = Date.now();

function getNextId()
{
    const now = Date.now();

    if (now < lastTimestamp)
    {
        lastTimestamp = now;
        idCounter = 0;
    }

    if (now !== lastTimestamp)
    {
        lastTimestamp = now;
        idCounter = 0;
    }

    let id;
    do
    {
        id = `${ lastTimestamp }-${ idCounter++ }`;
    }
    while (pendingMap.has(id));

    return id;
}

child.on('message', (msg) =>
{
    const { id, result, error } = msg;
    const callback = pendingMap.get(id);
    if (!callback) return;

    pendingMap.delete(id);
    if (error) callback.reject(new Error(error));
    else callback.resolve(result);
});

process.on('exit', () =>
{
    child.kill();
});

function dbCommand(cmd, ...args)
{
    return new Promise((resolve, reject) =>
    {
        const id = getNextId();
        pendingMap.set(id, { resolve, reject });
        child.send({ cmd, id, args });
    });
}

export function dbCommandWithTimeout(ms, cmd, ...args)
{
    return Promise.race([
        dbCommand(cmd, ...args),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`dbCommand timeout: ${ cmd }`)), ms))
    ]);
}