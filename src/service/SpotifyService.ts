import NoTopItemsError from '../classes/errors/NoTopItemsError';
import ValidationError from '../classes/errors/ValidationError';

const usersTopItemsBaseURI = 'https://api.spotify.com/v1/me/top/';
const userProfileURI = 'https://api.spotify.com/v1/me';
const topArtists = 'top-artists';
const topTracks = 'top-tracks';
const newReleases = 'new-releases';

export default async function createPlaylist(formData: PlaylistFormData) {
    const playlistItems = await retrievePlaylistItems(formData);
    console.log(`PLAYLIST SEED TYPE: ${playlistItems.seedType} PLAYLIST SEED URIs: ${playlistItems.uris}`);
    const userId = await retrieveUserId();
    console.log(`USER ID: ${userId}`);
    const playlistId = await postPlaylist(userId, formData);
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
        case newReleases: 
            return await retrieveNewTrackURIs();
        default:
            throw new ValidationError('Please specify what to base your new playlist on (top artist, top tracks, or new releases)');
    }
}

async function retrieveTopArtistTracksURIs(): Promise<PlaylistItems> {
    try {
        let topArtistIds = await retrieveTopArtistIds();
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

async function retrieveTopArtistIds() {
    let localToken = localStorage.getItem('spotify_access_token');
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
    return topArtistsItems.map(
        item => item.id
    );
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

async function retrieveNewTrackURIs(): Promise<PlaylistItems> {
        let newReleasesAlbumIds = await retrieveNewReleases();
        console.log(`NEW RELEASES ALBUM IDS: ${newReleasesAlbumIds}`);
        let newReleasesTracksURIs = await retrieveTrackURIsFromAlbums(newReleasesAlbumIds);
        return {
            seedType: newReleases,
            uris: newReleasesTracksURIs
        }
}

async function retrieveNewReleases() {
    let localToken = localStorage.getItem('spotify_access_token');
    const newReleasesUrl = 'https://api.spotify.com/v1/browse/new-releases?limit=20'
    const options = {
        method: 'GET',
        headers: {'Authorization': `Bearer ${localToken}`}
    }
    let response = await fetch(newReleasesUrl, options);
    const newReleasesResponse = await response!.json() as NewReleases; 
    console.log('NEW RELEASES RESPONSE: ' + JSON.stringify(newReleasesResponse));
    let newReleasesResponseItems = newReleasesResponse.albums.items;
    verifyNewReleasesItemsIsPopulated(newReleasesResponseItems);
    return newReleasesResponseItems.map(newAlbum => newAlbum.id)
    .map(id => String(id)).join(',');
}

async function retrieveTrackURIsFromAlbums(newReleasesAlbumIds: string): Promise<string[]> {
    let localToken = localStorage.getItem('spotify_access_token');
    const getSeveralAlbumsUrl = `https://api.spotify.com/v1/albums?ids=${newReleasesAlbumIds}`;
    const options = {
        method: 'GET',
        headers: {'Authorization': `Bearer ${localToken}`}
    }
    let response = await fetch(getSeveralAlbumsUrl, options);
    const getSeveralAlbumsResponse = await response!.json() as Album[];
    console.log('GET SEVERAL ALBUMS RESPONSE: ' + JSON.stringify(getSeveralAlbumsResponse));
    let newTrackURIs: string[] = [];
    for (let index = 0; index < getSeveralAlbumsResponse.length; index++) {
        const album = getSeveralAlbumsResponse[index];
        const albumTracks = album.tracks;
        let indexOfTrackToRetrieve = Math.floor(Math.random() * albumTracks.total);
        console.log(`indexOfTrackToRetrieve: ${indexOfTrackToRetrieve}`);
        newTrackURIs.push(albumTracks.items[indexOfTrackToRetrieve].uri);
    }
    return newTrackURIs;
}

async function verifyTopItemsIsPopulated(items: TopArtist[] | TopTrack[], topItemType: string): Promise<void> {
    if (!items || items.length === 0) {
        console.error(`The user does not have any ${topItemType}`);
        throw new NoTopItemsError(`The user does not have any ${topItemType}`);
    }
}

async function verifyNewReleasesItemsIsPopulated(items: NewAlbum[]): Promise<void> {
    if (!items || items.length === 0) {
        console.error('No new releases were returned');
        throw new Error('No new releases were returned. Please try another option to generate a playlist.')
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

async function postPlaylist(userId: string, formData: PlaylistFormData): Promise<string> {
    let localToken = localStorage.getItem('spotify_access_token');
    try {
        const url = 'https://api.spotify.com/v1/users/{user_id}/playlists'.replace('{user_id}', userId);
        const options = {
            method: 'POST',
            headers: {'Authorization': `Bearer ${localToken}`},
            body: JSON.stringify({
                name: formData.playlistName,
                public: formData.isPublic,
                description: formData.playlistDescription ? formData.playlistDescription : 'Playlist generated by the Tune Curator app'
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