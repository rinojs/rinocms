import { randomUUID } from 'crypto';

export function requestId()
{
    return (req, res, next) =>
    {
        const id = randomUUID();
        req.id = id;
        res.setHeader('X-Request-ID', id);
        next();
    };
}