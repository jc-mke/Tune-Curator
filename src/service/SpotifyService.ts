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
            throw new ValidationError('Please specify what to base your recommendations on (artists, tracks, or genre)');
    }
}

async function retrieveTopArtistIds(): Promise<string> {
    verifyTokenExists();
    try {
        const url = `${usersTopItemsBaseURI}artists`
        const options = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${token}`}
        }
        let response = await fetch(url, options);
        const topArtistsResponse = await response!.json() as UsersTopItems;
        console.log('TOP ARTISTS RESPONSE: ' + JSON.stringify(topArtistsResponse));
        let topArtistsItems = topArtistsResponse.items;
        verifyTopItemsIsPopulated(topArtistsItems, topArtists);
        topArtistsItems = [...new Set(topArtistsItems)];
        const commaSeparatedStringOfUsersTopArtistsIds = mapTopItemIds(topArtistsItems);
        console.log('USER\'S TOP ARTISTS IDS AS STRING: ' + commaSeparatedStringOfUsersTopArtistsIds);
        return commaSeparatedStringOfUsersTopArtistsIds; 
    } catch (error) {
        throw new Error(`Failed to retrieve your ${topArtists} Please try again.`);
    }
}

async function retrieveTopTrackIds(): Promise<string> {
    verifyTokenExists();
    try {
        const url = `${usersTopItemsBaseURI}tracks`
        const options = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${token}`}
        }
        let response = await fetch(url, options);
        const topTracksResponse = await response!.json() as UsersTopItems; 
        console.log('TOP TRACKS RESPONSE: ' + JSON.stringify(topTracksResponse));
        let topTracksItems = topTracksResponse.items;
        verifyTopItemsIsPopulated(topTracksItems, topTracks);
        topTracksItems = [...new Set(topTracksItems)];
        const commaSeparatedStringOfUsersTopTracksIds = mapTopItemIds(topTracksItems);
        console.log('USER\'S TOP TRACKS IDS AS STRING: ' + commaSeparatedStringOfUsersTopTracksIds);
        return commaSeparatedStringOfUsersTopTracksIds;
    } catch (error) {
        throw new Error(`Failed to retrieve your ${topTracks} Please try again.`);
    }
}

async function retrieveTopGenres(): Promise<string> {
    verifyTokenExists();
    try {
        // genres are attached to artists, so fetching top artists first
        const url = `${usersTopItemsBaseURI}artists`
        const options = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${token}`}
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
        const commaSeparatedStringOfUsersTopGenres = uniqueGenres.map(genre => String(genre)).join(',');
        
        console.log('USER\'S TOP GENRES AS STRING: ' + commaSeparatedStringOfUsersTopGenres);
        return commaSeparatedStringOfUsersTopGenres; 
    } catch (error) {
        throw new Error(`Failed to retrieve your ${topArtists} Please try again.`);
    }
}

async function verifyTokenExists(): Promise<void> {
    if (!token) {
        console.error('Access token does not exist');
        throw new Error('Access token does not exist');
    }
}

async function verifyTopItemsIsPopulated(items: TopArtist[] | TopTrack[], topItemType: string): Promise<void> {
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