export function getCookieValue(cookieHeader, name)
{
    if (!cookieHeader || !name) return null;

    const cookies = cookieHeader.split(';');

    for (const cookie of cookies)
    {
        const [rawKey, ...rawValue] = cookie.trim().split('=');

        if (rawKey !== name) continue;

        return decodeURIComponent(rawValue.join('='));
    }

    return null;
}

export function getSessionCookieOptions()
{
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
    };
}

export function getSessionCookieClearOptions()
{
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    };
}
