import Form from '../classes/Form';
import NoTopItemsError from '../classes/errors/NoTopItemsError';
import ValidationError from '../classes/errors/ValidationError';

const usersTopItemsBaseURI = 'https://api.spotify.com/v1/me/top/';
const recommendationsBaseURI = 'https://api.spotify.com/v1/recommendations';
const topArtists = 'top-artists';
const topTracks = 'top-tracks';
const recentGenres = 'recent-genres';

export default async function fetchArtistRecommendations(form: Form) {
    /* call the appropriate endpoint to retrieve the values for the 
    seed_artists, seed_genres, or seed_tracks parameters */
    const recommendationsSeed = await retrieveRecommendationsSeedValues(form);
    console.log(`RECOMMENDATIONS SEED KEY/VALUE PAIR: ${recommendationsSeed.entries()}`);
    let localToken = localStorage.getItem('spotify_access_token');
    console.log('token retrieved in function scope: ' + localToken);

    const params = buildArtistRecommendationsRequestParams(recommendationsSeed, form);
    const url = `${recommendationsBaseURI}${params}`;
    const options = {
        method: 'GET',
        headers: {'Authorization': `Bearer ${localToken}`}
    }
    console.log('URL for recommendations request: ' + url);
    let response = await fetch(url, options);
    console.log('recommendations response: ' + JSON.stringify(response!.json()));
}

async function retrieveRecommendationsSeedValues(form: Form): Promise<Map<string, string>> {
    const recommendationsSeed = form.recommendationsSeed; 
    switch (recommendationsSeed) {
        case topArtists:
            return retrieveTopArtistIds();
        case topTracks:
            return retrieveTopTrackIds();
        case recentGenres:
            return retrieveRecentGenres();
        default:
            throw new ValidationError('Please specify what to base your recommendations on (artists, tracks, or genre)');
    }
}

async function retrieveTopArtistIds(): Promise<Map<string, string>> {
    let localToken = localStorage.getItem('spotify_access_token');
    console.log('token retrieved in function scope: ' + localToken);
    try {
        const url = `${usersTopItemsBaseURI}artists`;
        const options = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${localToken}`}
        }
        let response = await fetch(url, options);
        const topArtistsResponse = await response!.json() as UsersTopItems;
        console.log('TOP ARTISTS RESPONSE: ' + JSON.stringify(topArtistsResponse));
        let topArtistsItems = topArtistsResponse.items;
        verifyTopItemsIsPopulated(topArtistsItems, topArtists);
        topArtistsItems = [...new Set(topArtistsItems)];
        return new Map([
            ['seed_artists', mapTopItemIds(topArtistsItems)]
        ]);
    } catch (error) {
        throw new Error(`Failed to retrieve your ${topArtists} Please try again.`);
    }
}

async function retrieveTopTrackIds(): Promise<Map<string, string>> {
    let localToken = localStorage.getItem('spotify_access_token');
    console.log('token retrieved in function scope: ' + localToken);
    try {
        const url = `${usersTopItemsBaseURI}tracks`
        const options = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${localToken}`}
        }
        let response = await fetch(url, options);
        const topTracksResponse = await response!.json() as UsersTopItems; 
        console.log('TOP TRACKS RESPONSE: ' + JSON.stringify(topTracksResponse));
        let topTracksItems = topTracksResponse.items;
        verifyTopItemsIsPopulated(topTracksItems, topTracks);
        topTracksItems = [...new Set(topTracksItems)];
        return new Map([
            ['seed_tracks', mapTopItemIds(topTracksItems)]
        ]);
    } catch (error) {
        throw new Error(`Failed to retrieve your ${topTracks} Please try again.`);
    }
}

async function retrieveRecentGenres(): Promise<Map<string, string>> {
    let localToken = localStorage.getItem('spotify_access_token');
    console.log('token retrieved in function scope: ' + localToken);
    try {
        // genres are attached to artists, so fetching top artists first
        const url = `${usersTopItemsBaseURI}artists`
        const options = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${localToken}`}
        }
        let response = await fetch(url, options);
        const topArtistsResponse = await response!.json() as UsersTopItems;
        console.log('TOP ARTISTS RESPONSE: ' + JSON.stringify(topArtistsResponse));
        let topArtistsItems = topArtistsResponse.items as TopArtist[];
        verifyTopItemsIsPopulated(topArtistsItems, topArtists);
        topArtistsItems = [...new Set(topArtistsItems)];
        let genres = topArtistsItems.slice(0, 5).map(
            item => item.genres[0]
        );
        let uniqueGenres = [...new Set(genres)];
        return new Map([
            ['seed_genres', uniqueGenres.map(genre => String(genre)).join(',')]
        ]);
    } catch (error) {
        throw new Error(`Failed to retrieve your ${topArtists} Please try again.`);
    }
}

function buildArtistRecommendationsRequestParams(recommendationsSeed: Map<string, string>, form: Form): string {
    if (!recommendationsSeed) {
        console.error('recommendations seed map was not populated as expected');
    }
    const mapIterator = recommendationsSeed.entries();
    if (!mapIterator) {
        console.error('no entries exist in the recommendations seed map');
    }
    const firstEntry = mapIterator.next();
    if (!firstEntry) {
        console.error('first entry does not exist in the recommendations seed map');
    }
    const firstEntryValue = firstEntry.value;
    if (!firstEntryValue) {
        console.error('first entry does not have a value in the recommendations seed map');
    }
    let params = '?' + firstEntryValue![0] + '=' + firstEntryValue![1];
    params = params + '&min_popularity=0&max_popularity=100';
    params = params + '&target_popularity=' + form.popularity.toString();
    params = params + '&min_danceability=0&max_danceability=1';
    params = params + '&target_danceability=' + form.danceability.toString();
    params = params + '&min_energy=0&max_energy=1';
    params = params + '&target_energy=' + form.energy.toString();
    params = params + '&min_instrumentalness=0&max_instrumentalness=1';
    params = params + '&target_instrumentalness=' + form.instrumentalness.toString();
    console.log('recommendations request params: ' + params);
    return params;
    
}

async function verifyTopItemsIsPopulated(items: TopArtist[] | TopTrack[], topItemType: string): Promise<void> {
    if (items.length === 0) {
        console.error(`The user does not have any ${topItemType}`);
        throw new NoTopItemsError(`The user does not have any ${topItemType}`);
    }
}

function mapTopItemIds(items: TopArtist[] | TopTrack[]): string {
    return items.slice(0, 5).map(
        item => item.id
    ).map(
        id => String(id)).join(',');
}