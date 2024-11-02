import Form from '../classes/Form';
import NoTopItemsError from '../classes/errors/NoTopItemsError';
import ValidationError from '../classes/errors/ValidationError';

const token = localStorage.getItem('spotify_access_token');
const usersTopItemsBaseURI = 'https://api.spotify.com/v1/me/top/';
const topArtists = 'top-artists';
const topTracks = 'top-tracks';
const topGenres = 'top-genres';

export default async function fetchArtistRecommendations(form: Form) {
    /* call the appropriate endpoint to retrieve the values for the 
    seed_artists, seed_genres, or seed_tracks parameters */
    const recommendationsSeedValues = await retrieveRecommendationsSeedValues(form);
    console.log(`RECOMMENDATIONS SEED VALUES: ${recommendationsSeedValues}`);

}

async function retrieveRecommendationsSeedValues(form: Form): Promise<string> {
    const recommendationsSeed = form.recommendationsSeed; 
    switch (recommendationsSeed) {
        case topArtists:
            return retrieveTopArtistIds();
        case topTracks:
            return retrieveTopTrackIds();
        case topGenres:
            return retrieveTopGenres();
        default:
            throw new ValidationError('Please specify what to base your recommendations on (artists, tracks or genre)');
    }
}

async function retrieveTopArtistIds(): Promise<string> {
    verifyTokenExists();
    console.log('TOKEN: ' + token);

    const result = await fetch(usersTopItemsBaseURI + 'artists', {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    });

    verify200Response(result, topArtists);

    const topArtistsResponse = await result.json() as UsersTopItems;
    console.log('TOP ARTISTS RESPONSE: ' + JSON.stringify(topArtistsResponse));
    const topArtistsItems = topArtistsResponse.items;
    verifyTopItemsIsPopulated(topArtistsItems, topArtists);
    const commaSeparatedStringOfUsersTopArtistsIds = mapTopItemIds(topArtistsItems);
    console.log('USER\'S TOP ARTISTS IDS AS STRING: ' + commaSeparatedStringOfUsersTopArtistsIds);
    return commaSeparatedStringOfUsersTopArtistsIds; 
}

async function retrieveTopTrackIds(): Promise<string> {
    verifyTokenExists();

    const result = await fetch(usersTopItemsBaseURI + 'tracks', {
        method: 'GET', headers: { Authorization: `Bearer ${token}`}
    });

    verify200Response(result, topTracks);

    const topTracksResponse = await result.json() as UsersTopItems; 
    console.log('TOP TRACKS RESPONSE: ' + JSON.stringify(topTracksResponse));
    const topTracksItems = topTracksResponse.items;
    verifyTopItemsIsPopulated(topTracksItems, topTracks);
    const commaSeparatedStringOfUsersTopTracksIds = mapTopItemIds(topTracksItems);
    console.log('USER\'S TOP TRACKS IDS AS STRING: ' + commaSeparatedStringOfUsersTopTracksIds);
    return commaSeparatedStringOfUsersTopTracksIds;
}

async function retrieveTopGenres(): Promise<string> {
    verifyTokenExists();

    // genres are attached to artists, so fetching top artists first
    const result = await fetch(usersTopItemsBaseURI + 'artists', {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
    });

    verify200Response(result, topArtists);

    const topArtistsResponse = await result.json() as UsersTopItems;
    console.log('TOP ARTISTS RESPONSE: ' + JSON.stringify(topArtistsResponse));
    const topArtistsItems = topArtistsResponse.items as TopArtist[];
    verifyTopItemsIsPopulated(topArtistsItems, topArtists);
    const commaSeparatedStringOfUsersTopGenres = topArtistsItems.map(
        item => item.genres[0]
    ).map(
        genre => String(genre)).join(',');
    
    console.log('USER\'S TOP GENRES AS STRING: ' + commaSeparatedStringOfUsersTopGenres);
    return commaSeparatedStringOfUsersTopGenres; 
}

async function verifyTokenExists() {
    if (!token) {
        console.error('Access token does not exist');
        throw new Error('Access token does not exist');
    }
}

async function verify200Response(response: Response, requestType: string) {
    if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error fetching ${requestType}: ${JSON.stringify(errorData)}`);
        throw new Error(errorData.error.message);
    }
}

async function verifyTopItemsIsPopulated(items: TopArtist[] | TopTrack[], topItemType: string) {
    if (items.length === 0) {
        console.error(`The user does not have any ${topItemType}`);
        throw new NoTopItemsError(`The user does not have any ${topItemType}`);
    }
}

async function mapTopItemIds(items: TopArtist[] | TopTrack[]): Promise<string> {
    return items.slice(0, 5).map(
        item => item.id
    ).map(
        id => String(id)).join(',');
}