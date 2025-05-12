import { generateKeyPair, exportJWK } from 'jose';

const { publicKey } = await generateKeyPair('RS256');
const jwk = await exportJWK(publicKey);
console.log(jwk);
