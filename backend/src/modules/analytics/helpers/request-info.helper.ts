import { Request } from 'express';

export function extractRequestInfo(req: Request) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip =
    typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : req.ip || (req.connection && req.connection.remoteAddress) || null;

  const userAgent =
    (req.headers['user-agent'] as string) ?? req.get('User-Agent') ?? null;

  const referer =
    (req.headers['referer'] as string) ?? req.get('referer') ?? null;

  return { ipAddress: ip, userAgent, referer };
}
