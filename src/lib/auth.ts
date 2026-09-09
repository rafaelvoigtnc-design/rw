import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'rw-brinquedos-secret-key-2024'
);

console.log('JWT_SECRET configurado:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET valor:', process.env.JWT_SECRET ? '***' : 'usando default');

export async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, 10);
  console.log('🔒 Senha hasheada:', hash.substring(0, 20) + '...');
  return hash;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const result = await bcrypt.compare(password, hash);
  console.log('🔍 Verificação de senha:', result);
  return result;
}

export async function createToken(payload: any): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  console.log('🎟️ Token criado para payload:', payload);
  return token;
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log('✅ Token verificado:', payload);
    return payload;
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    return null;
  }
}

export async function createAdminToken(adminId: string): Promise<string> {
  return createToken({ type: 'admin', id: adminId });
}

export async function createClientToken(clientId: string): Promise<string> {
  return createToken({ type: 'client', id: clientId });
}
