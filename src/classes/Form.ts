class Form {
    private _recommendationsSeed: string;
    private _popularity: number; 
    private _danceability: number;
    private _energy: number;
    private _instrumentalness: number; 

    private _recommendationsSeedList: string[] = ['top-artists', 'top-tracks', 'recent-genres'];

    constructor(recommendationsSeed: string, popularity: number, danceability: number, energy: number, instrumentalness: number) {
        this._recommendationsSeed = recommendationsSeed; 
        this._popularity = popularity; 
        this._danceability = danceability; 
        this._energy = energy; 
        this._instrumentalness = instrumentalness;
    }

    public get recommendationsSeed() {
        return this._recommendationsSeed;
    }

    public set recommendationsSeed(theRecommendationsSeed: string) {
        if (!this._recommendationsSeedList.includes(theRecommendationsSeed)) {
            throw new Error(`Invalid recommendation seed: ${theRecommendationsSeed}`);
        }
        this._recommendationsSeed = theRecommendationsSeed;
    }

    public get popularity() {
        return this._popularity;
    }

    public set popularity(thePopularity: number) {
        if (thePopularity < 0 || thePopularity > 1) {
            throw new Error('popularity value must be between 0 and 1');
        }
        this._popularity = thePopularity;
    }

    public get danceability() {
        return this._danceability;
    }

    public set danceability(theDanceability: number) {
        if (theDanceability < 0 || theDanceability > 1) {
            throw new Error('danceability value must be between 0 and 1');
        }
        this._danceability = theDanceability;
    }

    public get energy() {
        return this._energy;
    }

    public set energy(theEnergy: number) {
        if (theEnergy < 0 || theEnergy > 1) {
            throw new Error('energy value must be between 0 and 1');
        }
        this._energy = theEnergy;
    }

    public get instrumentalness() {
        return this._instrumentalness;
    }

    public set instrumentalness(theInstrumentalness: number) {
        if (theInstrumentalness < 0 || theInstrumentalness > 1) {
            throw new Error('instrumentalness value must be between 0 and 1');
        }
        this._instrumentalness = theInstrumentalness;
    }
}
export default Form;