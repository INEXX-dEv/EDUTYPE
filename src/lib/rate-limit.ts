import prisma from './prisma';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW || '60000');
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '100');

// In-memory rate limiter for speed
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

export async function checkRateLimit(
  ip: string,
  endpoint: string,
  maxRequests: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS
): Promise<RateLimitResult> {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now - record.windowStart > windowMs) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(now + windowMs),
    };
  }

  record.count += 1;

  if (record.count > maxRequests) {
    // Log potential DDoS
    await prisma.systemLog.create({
      data: {
        level: 'WARN',
        message: `Rate limit exceeded: ${ip} on ${endpoint}`,
        metadata: JSON.stringify({ ip, endpoint, count: record.count }),
      },
    }).catch(() => { });

    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(record.windowStart + windowMs),
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: new Date(record.windowStart + windowMs),
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of Array.from(rateLimitMap.entries())) {
    if (now - record.windowStart > WINDOW_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

// DDoS Detection
const suspiciousIPs = new Map<string, { count: number; firstSeen: number }>();

export function detectDDoS(ip: string): boolean {
  const now = Date.now();
  const record = suspiciousIPs.get(ip);

  if (!record || now - record.firstSeen > 300000) { // 5 min window
    suspiciousIPs.set(ip, { count: 1, firstSeen: now });
    return false;
  }

  record.count++;

  // More than 500 requests in 5 minutes
  if (record.count > 500) {
    return true;
  }

  return false;
}
