import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';


const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.error('No authorization header');
    return res.status(401).json({ message: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.decode(token);
    logger.info(`Decoded token: ${JSON.stringify(decodedToken)}`);
    if (typeof decodedToken === 'object' && decodedToken !== null) {
      logger.info(`Token issuer: ${decodedToken.iss}`);
    }
    logger.info(`Expected issuer: https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`);
  } catch (error) {
    logger.error(`Error decoding token: ${error}`);
  }

  expressjwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/discovery/v2.0/keys`
    }) as GetVerificationKey,
    audience: `api://${process.env.AZURE_CLIENT_ID}`,
    issuer: [`https://sts.windows.net/${process.env.AZURE_TENANT_ID}/`,
        `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`
    ],
    algorithms: ['RS256']
  })(req, res, (err) => {
    if (err) {
      logger.error(`Auth error: ${err.message}, Stack: ${err.stack}`);
      return res.status(401).json({ message: 'Unauthorized', error: err.message });
    }
    logger.info(`User authenticated: ${(req as any).auth.sub}`);
    next();
  });
};

export default authMiddleware;