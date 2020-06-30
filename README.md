# eab-openid-connect
In this project library, it provides different approaches for OpenID authentication with OpenID Access Token attached in HTTP request headers.
You can use every single function to authenticate with, or just use verifyJWT as a starting point.

Easy usage example:
```
import openidConfig from '../path/to/openidConfig.json';
const { verifyJWT } = require('eab-openid-connect');
...
[express]
router.get('/routeToProtect', verifyJWT(JSON.stringify(openidConfig)), (req, res) => {...});
```

openidConfig.json:
```
{
    "openidPublicKey": "...",
    "openidEndpoint": "...",
    "authLevel": 1,
    "enabled": true
}
```

----------------------------------------------------------------------------------------------------------
# Functions exported 
```
verifyJWT(configJsonString) {...}
```
`verifyJWT()` accepts the config JSON and perform different level of authentication regarding *authLevel*.
: *openidPublicKey* should be provided with header and footer as the whole string.
: *openidEndpoint* refers to the endpoint of OpenID which can perform the authentication with Access Token in HTTP request headers.
: *authLevel*: 1 => Authenticate by verifying the JWT with public key locally. 2 => Authenticate by sending POST request to OpenID endpoint to authenticate.
: *enabled* indicates whether the authentication process is enforced. If `false`, no authentication will be carried out.


```
verifyWithOpenIDJwtToken(publicKey) {...}
```
`verifyWithOpenIDJwtToken()` accepts the public key as the only parameter to authenticate by decoding the JWT and checking the token expiration time.


```
verifyWithOpenIDEndpoint(authEndpoint) {...}
```
`verifyWithOpenIDEndpoint()` accepts the authEndpoint as the only parameter to authenticate by sending a new POST request to this endpoint with the same Bearer headers attached in the caller HTTP request. In the headers, the access token is attached and then authenticated by the OpenID endpoint. 


