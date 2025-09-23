/**
 * SallyPort Authentication Verification
 * Single point of entry - sallyport.2100.cool security control
 */

const jwt = require('jsonwebtoken');

/**
 * Verify SallyPort session token
 * @param {Object} request - Request object with authorization header
 * @returns {Object} Decoded token with user info
 */
async function verifySallyPortSession(request) {
  const authHeader = request.headers.authorization || request.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  try {
    // For production, this would verify against a secret from Google Secret Manager
    const secretKey = process.env.SALLYPORT_JWT_SECRET || 'sallyport-secret-key-diamond-sao-2100';

    // Verify JWT token
    const decoded = jwt.verify(token, secretKey);

    // SallyPort specific validation
    if (!decoded.user || !decoded.user.email) {
      throw new Error('Invalid token structure');
    }

    // Validate SallyPort access permissions
    const allowedDomains = ['coaching2100.com', 'aipub.2100.cool', '2100.cool', 'asoos.2100.cool'];

    const userDomain = decoded.user.email.split('@')[1];
    if (!allowedDomains.includes(userDomain)) {
      throw new Error('Domain not authorized for SallyPort access');
    }

    // Special handling for pr@coaching2100.com
    if (decoded.user.email === 'pr@coaching2100.com') {
      decoded.user.role = 'Diamond SAO';
      decoded.user.permissions = ['all'];
      decoded.user.sallyport_access = true;
      decoded.user.mcp_access = true;
    }

    return {
      valid: true,
      user: decoded.user,
      token: decoded,
    };
  } catch (error) {
    throw new Error(`SallyPort verification failed: ${error.message}`);
  }
}

/**
 * Generate SallyPort session token
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
function generateSallyPortToken(user) {
  const secretKey = process.env.SALLYPORT_JWT_SECRET || 'sallyport-secret-key-diamond-sao-2100';

  const payload = {
    user: {
      email: user.email,
      role: user.role || 'user',
      permissions: user.permissions || [],
      uid: user.uid || `user-${Date.now()}`,
      sallyport_verified: true,
    },
    iss: 'sallyport.2100.cool',
    aud: '*.2100.cool',
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, secretKey);
}

/**
 * SallyPort middleware for Express
 */
function sallyPortMiddleware(req, res, next) {
  verifySallyPortSession(req)
    .then((result) => {
      req.user = result.user;
      req.sallyport = result;
      next();
    })
    .catch((error) => {
      res.status(401).json({
        error: 'SallyPort Authentication Failed',
        message: error.message,
        sallyport: 'access_denied',
      });
    });
}

module.exports = {
  verifySallyPortSession,
  generateSallyPortToken,
  sallyPortMiddleware,
};
