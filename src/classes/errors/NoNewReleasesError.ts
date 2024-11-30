class NoNewReleasesError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NoNewReleasesError';
    }
}

export default NoNewReleasesError;