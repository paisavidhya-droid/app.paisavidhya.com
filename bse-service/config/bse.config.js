// config/bse.config.js
import 'dotenv/config';

const isProd = process.env.BSE_ENV === 'production';

export const BSE_CONFIG = {
  env: process.env.BSE_ENV || 'sandbox',
  memberCode: process.env.BSE_MEMBER_CODE,
  orgCode: process.env.BSE_ORG_CODE,
  orgFingerprint: process.env.BSE_ORG_FINGERPRINT,
  baseUrl: isProd
    ? process.env.BSE_BASE_URL_PROD
    : process.env.BSE_BASE_URL_SANDBOX,
  rsaPrivateKeyPath: process.env.BSE_RSA_PRIVATE_KEY_PATH,
  rsaPublicKeyPath: process.env.BSE_RSA_PUBLIC_KEY_PATH,
  bsePublicKeyPath: process.env.BSE_BSE_PUBLIC_KEY_PATH,
  webhookSecret: process.env.BSE_WEBHOOK_SECRET,
};
