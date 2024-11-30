class AccessTokenExpiredError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AccessTokenExpiredError';
    }
}

export default AccessTokenExpiredError;