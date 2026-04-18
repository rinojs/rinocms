import { USERNAME_REGEX, EMAIL_REGEX, PASSWORD_REGEX } from '../config.js';
import { badRequest } from './errorResponse.js';

/**
 * Middleware factory that validates request body fields using regex patterns.
 * @param {Array<'username'|'email'|'password'>} fields - Fields to validate.
 * @returns {import('express').RequestHandler}
 */
export function validateRequest(fields)
{
    return (req, res, next) =>
    {
        const errors = [];

        if (fields.includes('username'))
        {
            const username = (req.body?.username || '').trim();
            if (!username || !USERNAME_REGEX.test(username))
                errors.push('Invalid username.');
        }

        if (fields.includes('email'))
        {
            const email = (req.body?.email || '').trim();
            // Email is optional in some routes; only validate if present.
            if (email && !EMAIL_REGEX.test(email))
                errors.push('Invalid email.');
        }

        if (fields.includes('password'))
        {
            const password = String(req.body?.password || '').trim();
            if (!password || !PASSWORD_REGEX.test(password))
                errors.push('Invalid password.');
        }

        if (errors.length > 0)
            return badRequest(res, errors.join(' '));

        next();
    };
}
