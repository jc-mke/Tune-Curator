import NoTopItemsError from '../classes/errors/NoTopItemsError';
import ValidationError from '../classes/errors/ValidationError';

const usersTopItemsBaseURI = 'https://api.spotify.com/v1/me/top/';
const userProfileURI = 'https://api.spotify.com/v1/me';
const topArtists = 'top-artists';
const topTracks = 'top-tracks';

export default async function createPlaylist(formData: PlaylistFormData) {
    const playlistItems = await retrievePlaylistItems(formData);
    console.log(`PLAYLIST SEED TYPE: ${playlistItems.seedType} PLAYLIST SEED URIs: ${playlistItems.uris}`);
    const userId = await retrieveUserId();
    console.log(`USER ID: ${userId}`);
    const playlistId = await postPlaylist(userId);
    console.log(`PLAYLIST ID: ${playlistId}`);
    await populatePlaylist(playlistId, playlistItems);
    console.log('SUCCESSFULLY CREATED AND POPULATED NEW PLAYLIST');
}

async function retrievePlaylistItems(formData: PlaylistFormData): Promise<PlaylistItems> {
    const playlistSeed = formData.playlistSeed; 
    switch (playlistSeed) {
        case topArtists:
            return await retrieveTopArtistTracksURIs();
        case topTracks:
            return await retrieveTopTrackURIs();
        default:
            throw new ValidationError('Please specify what to base your new playlist on (artists or tracks)');
    }
}

async function retrieveTopArtistTracksURIs(): Promise<PlaylistItems> {
    let localToken = localStorage.getItem('spotify_access_token');
    try {
        const topArtistsUrl = `${usersTopItemsBaseURI}artists`;
        const options = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${localToken}`}
        }
        let response = await fetch(topArtistsUrl, options);
        const topArtistsResponse = await response!.json() as UsersTopItems;
        console.log('TOP ARTISTS RESPONSE: ' + JSON.stringify(topArtistsResponse));
        let topArtistsItems = topArtistsResponse.items as TopArtist[];
        verifyTopItemsIsPopulated(topArtistsItems, topArtists);
        topArtistsItems = [...new Set(topArtistsItems)];
        let topArtistIds = topArtistsItems.map(
            item => item.id
        );
        let artistsTopTracksURIs = await retrieveArtistsTopTracks(topArtistIds);
        console.log(`ARTISTS TOP TRACKS URIs: ${artistsTopTracksURIs}`);
        return {
            seedType: topArtists,
            uris: artistsTopTracksURIs
        }
    } catch (error) {
        console.error(error);
        throw new Error(`Failed to retrieve your ${topArtists} Please try again.`);
    }
}

async function retrieveArtistsTopTracks(artistIds: string[]): Promise<string[]> {
    let localToken = localStorage.getItem('spotify_access_token');
    let artistTopTracksURIs: string[] = []; 
    for (let index = 0; index < artistIds.length; index++) {
        const artistId = artistIds[index];
        try {
            const artistTopTracksUrl = 'https://api.spotify.com/v1/artists/{id}/top-tracks'.replace('{id}', artistId);
            const options = {
                method: 'GET',
                headers: {'Authorization': `Bearer ${localToken}`}
            }
            let response = await fetch(artistTopTracksUrl, options);
            const artistsTopTracksResponse = await response!.json(); 
            console.log(`ARTIST TOP TRACKS RESPONSE: ${JSON.stringify(artistsTopTracksResponse)}`);
            const artistsTopTracksArray = artistsTopTracksResponse.tracks;
            artistTopTracksURIs.push(artistsTopTracksArray[0].uri);
            artistTopTracksURIs.push(artistsTopTracksArray[1].uri);
        } catch (error) {
            console.error(error);
            throw new Error('Failed to retrieve the top tracks of one of your top artists');
        }
    }
    return artistTopTracksURIs;
}

async function retrieveTopTrackURIs(): Promise<PlaylistItems> {
    let localToken = localStorage.getItem('spotify_access_token');
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
        let topTracksURIs = topTracksItems.map(item => item.uri);
        return {
            seedType: topTracks,
            uris: topTracksURIs
        }
    } catch (error) {
        throw new Error(`Failed to retrieve your ${topTracks} Please try again.`);
    }
}

async function verifyTopItemsIsPopulated(items: TopArtist[] | TopTrack[], topItemType: string): Promise<void> {
    if (items.length === 0) {
        console.error(`The user does not have any ${topItemType}`);
        throw new NoTopItemsError(`The user does not have any ${topItemType}`);
    }
}

async function retrieveUserId(): Promise<string> {
    let localToken = localStorage.getItem('spotify_access_token');
    try {
        const url = userProfileURI;
        const options = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${localToken}`}
        }
        let response = await fetch(url, options);
        const userProfileResponse = await response!.json();
        return userProfileResponse.id; 
    } catch (error) {
        throw new Error('Failed to retrieve your user id to create a playlist for you. Please try again.');
    }
}

async function postPlaylist(userId: string): Promise<string> {
    let localToken = localStorage.getItem('spotify_access_token');
    try {
        const url = 'https://api.spotify.com/v1/users/{user_id}/playlists'.replace('{user_id}', userId);
        const options = {
            method: 'POST',
            headers: {'Authorization': `Bearer ${localToken}`},
            body: JSON.stringify({
                name: 'Tune Curator Generated Playlist',
                public: false,
                description: `Playlist generated by the Tune Curator app based on ${userId}'s top items`
            })
        }
        let response = await fetch(url, options);
        const postPlaylistResponse = await response!.json();
        return postPlaylistResponse.id; 
    } catch (error) {
        throw new Error('Failed to create a playlist for you. Please try again.');
    }
}

async function populatePlaylist(playlistId: string, playlistItems: PlaylistItems): Promise<void> {
    let localToken = localStorage.getItem('spotify_access_token');
    try {
        const url = 'https://api.spotify.com/v1/playlists/{playlist_id}/tracks'.replace('{playlist_id}', playlistId);
        const options = {
            method: 'POST',
            headers: {'Authorization': `Bearer ${localToken}`},
            body: JSON.stringify({
                uris: playlistItems.uris
            })
        }
        let response = await fetch(url, options);
        await response!.json();
    } catch (error) {
        throw new Error('Failed to populate playlist with your top items.');
    }
}