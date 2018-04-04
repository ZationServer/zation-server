CServer.prototype._processTokenError = function (err) {
    var authError = null;
    var isBadToken = true;

    if (err) {
        if (err.name == 'TokenExpiredError') {
            authError = new AuthTokenExpiredError(err.message, err.expiredAt);
        } else if (err.name == 'JsonWebTokenError') {
            authError = new AuthTokenInvalidError(err.message);
        } else if (err.name == 'NotBeforeError') {
            authError = new AuthTokenNotBeforeError(err.message, err.date);
            // In this case, the token is good; it's just not active yet.
            isBadToken = false;
        } else {
            authError = new AuthTokenError(err.message);
        }
    }

    return {
        authError: authError,
        isBadToken: isBadToken
    };
};

SCServer.prototype._processAuthToken = function (scSocket, signedAuthToken, callback) {
    var self = this;

    this.auth.verifyToken(signedAuthToken, this.verificationKey, this.defaultVerificationOptions, function (err, authToken) {
        if (authToken) {
            scSocket.signedAuthToken = signedAuthToken;
            scSocket.authToken = authToken;
            scSocket.authState = scSocket.AUTHENTICATED;
        } else {
            scSocket.signedAuthToken = null;
            scSocket.authToken = null;
            scSocket.authState = scSocket.UNAUTHENTICATED;
        }

        // If the socket is authenticated, pass it through the MIDDLEWARE_AUTHENTICATE middleware.
        // If the token is bad, we will tell the client to remove it.
        // If there is an error but the token is good, then we will send back a 'quiet' error instead
        // (as part of the status object only).
        if (scSocket.authToken) {
            self._passThroughAuthenticateMiddleware({
                socket: scSocket,
                signedAuthToken: scSocket.signedAuthToken,
                authToken: scSocket.authToken
            }, function (middlewareError, isBadToken) {
                if (middlewareError) {
                    scSocket.authToken = null;
                    scSocket.authState = scSocket.UNAUTHENTICATED;
                    if (isBadToken) {
                        self._emitBadAuthTokenError(scSocket, middlewareError, signedAuthToken);
                    }
                }
                // If an error is passed back from the authenticate middleware, it will be treated as a
                // server warning and not a socket error.
                callback(middlewareError, isBadToken || false);
            });
        } else {
            var errorData = self._processTokenError(err);

            // If the error is related to the JWT being badly formatted, then we will
            // treat the error as a socket error.
            if (err && signedAuthToken != null) {
                scSocket.emit('error', errorData.authError);
                if (errorData.isBadToken) {
                    self._emitBadAuthTokenError(scSocket, errorData.authError, signedAuthToken);
                }
            }
            callback(errorData.authError, errorData.isBadToken);
        }
    });
};


if (opts.authPrivateKey != null || opts.authPublicKey != null) {
    if (opts.authPrivateKey == null) {
        throw new InvalidOptionsError('The authPrivateKey option must be specified if authPublicKey is specified');
    } else if (opts.authPublicKey == null) {
        throw new InvalidOptionsError('The authPublicKey option must be specified if authPrivateKey is specified');
    }
    this.signatureKey = opts.authPrivateKey;
    this.verificationKey = opts.authPublicKey;
} else {
    if (opts.authKey == null) {
        opts.authKey = crypto.randomBytes(32).toString('hex');
    }
    this.signatureKey = opts.authKey;
    this.verificationKey = opts.authKey;
}

this.authVerifyAsync = opts.authVerifyAsync;
this.authSignAsync = opts.authSignAsync;

this.defaultVerificationOptions = {
    async: this.authVerifyAsync
};
this.defaultSignatureOptions = {
    expiresIn: opts.authDefaultExpiry,
    async: this.authSignAsync
};

if (opts.authAlgorithm != null) {
    this.defaultVerificationOptions.algorithms = [opts.authAlgorithm];
    this.defaultSignatureOptions.algorithm = opts.authAlgorithm;
}
