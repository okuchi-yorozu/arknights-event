import * as jose from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// UTF-8エンコードされたシークレットキーを作成
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

export const SESSION_DURATION = '24h';

export interface JWTPayload extends jose.JWTPayload {
  role: 'admin';
}

export const createToken = async () => {
  const jwt = await new jose.SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(secretKey);

  return jwt;
};

export const verifyToken = async (token: string): Promise<JWTPayload> => {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey);
    if (typeof payload.role !== 'string' || payload.role !== 'admin') {
      throw new Error('Invalid role');
    }
    return payload as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
