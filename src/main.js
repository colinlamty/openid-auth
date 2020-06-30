/* eslint-disable no-use-before-define */
const jwt = require('jsonwebtoken');
const request = require('request');

/**
 * verifyJWT() determines the authentication approache with parameter authLevel
 *
 * @param {string} configJsonString
 * JSON string containing authLevel, openidPublicKey, openidEndpoint, enabled::
 * authLevel          1 => Authenticate JWT Access Token with public key;
 *                    2 => Authenticate by POST to OpenID Endpoint
 * publicKey          Public Key for validating OpenID JWT Access Token
 * endpoint           OpendID Endpoint for authentication
 *
 */
function verifyJWT(configJsonString) {
  const {
    authLevel,
    openidPublicKey,
    openidEndpoint,
    enabled,
  } = JSON.parse(configJsonString);

  if (!enabled) {
    return (req, res, next) => next();
  }

  switch (authLevel) {
    case 1:
      return verifyWithOpenIDJwtToken(openidPublicKey);
    case 2:
      return verifyWithOpenIDEndpoint(openidEndpoint);
    default:
      return (req, res) => res.status(500).json({ error: 'Server Internal Error' });
  }
}

/**
 * verifyWithOpenIDJwtToken() offers OFFLINE JWT Token verification by using the public key
 *
 * @param {string} publicKey        Public Key for OpenID JWT verification
 */
function verifyWithOpenIDJwtToken(publicKey) {
  return (req, res, next) => {
    // Checking: if publicKey is valid input
    if (publicKey === '' || publicKey === 'undefined' || publicKey === null) {
      res.status(400).json({ error: 'Bad request' });
    }
    const openidPublicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;

    if (req.headers.authorization) {
      const accessToken = req.headers.authorization.split(' ')[1];
      if (accessToken === '' || accessToken === 'undefined' || accessToken === null) {
        res.status(400).json({ error: 'Bad Request' });
      }

      // Verify Access Token with jsonwebtoken plugin
      jwt.verify(accessToken, openidPublicKey, (error, decodedResult) => {
        if (error) {
          res.status(401).json({ error: 'Unauthorized' });
        }

        if (typeof (decodedResult) === 'object' && decodedResult.preferred_username
          && (decodedResult.exp * 1000 >= Date.now())) {
          next();
        } else {
          res.status(401).json({ error: 'Unauthorized' });
        }
      });
    } else {
      res.status(400).json({ error: 'Bad Request' });
    }
  };
}

/**
 * verifyWithOpenIDEndpoint() offers ONLINE authentication by sending POST request
 * to OpenID Endpoint to perform authentication
 *
 * @param {string} endpoint         OpenID Endpoint for authentication use
 */
function verifyWithOpenIDEndpoint(endpoint) {
  return (req, res, next) => {
    // Checking: if endpoint is valid input
    if (endpoint === '' || endpoint === 'undefined' || endpoint === null) {
      res.status(400).json({ error: 'Bad request' });
    }

    if (req.headers.authorization) {
      const endpointRequestOption = {
        method: 'post',
        url: endpoint,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: req.headers.authorization,
        },
        strictSSL: false,
        form: {},
      };

      request(endpointRequestOption, (error, requestResponse) => {
        if (error) {
          res.status(401).json({ error: 'Unauthorized' });
        }

        if (requestResponse.statusCode === 200) {
          next();
        } else {
          res.status(401).json({ error: 'Unauthorized' });
        }
      });
    } else {
      res.status(400).json({ error: 'Bad Request' });
    }
  };
}


module.exports.verifyJWT = verifyJWT;
module.exports.verifyWithOpenIDJwtToken = verifyWithOpenIDJwtToken;
module.exports.verifyWithOpenIDEndpoint = verifyWithOpenIDEndpoint;
