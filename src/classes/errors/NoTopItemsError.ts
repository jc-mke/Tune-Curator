class NoTopItemsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NoTopItemsError';
    }
}

export default NoTopItemsError;