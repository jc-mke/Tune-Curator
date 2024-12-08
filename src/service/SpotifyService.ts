import AccessTokenExpiredError from '../classes/errors/AccessTokenExpiredError';
import NoTopItemsError from '../classes/errors/NoTopItemsError';
import NoNewReleasesError from '../classes/errors/NoNewReleasesError';
import ValidationError from '../classes/errors/ValidationError';

const USERS_TOP_ITEMS_BASE_URI = 'https://api.spotify.com/v1/me/top/';
const USER_PROFILE_URI = 'https://api.spotify.com/v1/me';
const TOP_ARTISTS = 'top-artists';
const TOP_TRACKS = 'top-tracks';
const NEW_RELEASES = 'new-releases';
const PLAYLIST_TRACK_LIST_SAMPLE_SIZE = 10; 

export default async function createPlaylist(formData: PlaylistFormData): Promise<string> {
    const playlistItems = await retrievePlaylistItems(formData);
    console.log(`PLAYLIST SEED TYPE: ${playlistItems.seedType} PLAYLIST SEED URIs: ${playlistItems.uris}`);
    const userId = await retrieveUserId();
    console.log(`USER ID: ${userId}`);
    const playlistId = await postPlaylist(userId, formData);
    console.log(`PLAYLIST ID: ${playlistId}`);
    await populatePlaylist(playlistId, playlistItems);
    console.log('SUCCESSFULLY CREATED AND POPULATED NEW PLAYLIST');
    return playlistId;
}

async function retrievePlaylistItems(formData: PlaylistFormData): Promise<PlaylistItems> {
    const playlistSeed = formData.playlistSeed; 
    switch (playlistSeed) {
        case TOP_ARTISTS:
            return await retrieveTopArtistTracksURIs();
        case TOP_TRACKS:
            return await retrieveTopTrackURIs();
        case NEW_RELEASES: 
            return await retrieveNewTrackURIs();
        default:
            throw new ValidationError('Please specify what to base your new playlist on (top artists, top tracks, or new releases)');
    }
}

async function retrieveTopArtistTracksURIs(): Promise<PlaylistItems> {
    let topArtistIds = await retrieveTopArtistIds();
    let artistsTOP_TRACKSURIs = await retrieveArtistsTOP_TRACKS(topArtistIds);
    console.log(`ARTISTS TOP TRACKS URIs: ${artistsTOP_TRACKSURIs}`);
    return {
        seedType: TOP_ARTISTS,
        uris: artistsTOP_TRACKSURIs
    }
}

async function retrieveTopArtistIds() {
    let localToken = localStorage.getItem('spotify_access_token');
    const TOP_ARTISTSUrl = `${USERS_TOP_ITEMS_BASE_URI}artists`;
    const options = {
        method: 'GET',
        headers: {'Authorization': `Bearer ${localToken}`}
    }
    let response = await fetch(TOP_ARTISTSUrl, options);
    await checkForAccessTokenExpiredResponse(response);
    const TOP_ARTISTSResponse = await response!.json() as UsersTopItems;
    console.log('TOP ARTISTS RESPONSE: ' + JSON.stringify(TOP_ARTISTSResponse));
    let TOP_ARTISTSItems = TOP_ARTISTSResponse.items as TopArtist[];
    await verifyTopItemsIsPopulated(TOP_ARTISTSItems, 'top artists');
    TOP_ARTISTSItems = [...new Set(TOP_ARTISTSItems)];
    return TOP_ARTISTSItems.map(
        item => item.id
    );
}

async function retrieveArtistsTOP_TRACKS(artistIds: string[]): Promise<string[]> {
    let localToken = localStorage.getItem('spotify_access_token');
    let artistTOP_TRACKSURIs: string[] = []; 
    for (let index = 0; index < artistIds.length; index++) {
        const artistId = artistIds[index];
            const artistTOP_TRACKSUrl = 'https://api.spotify.com/v1/artists/{id}/top-tracks'.replace('{id}', artistId);
            const options = {
                method: 'GET',
                headers: {'Authorization': `Bearer ${localToken}`}
            }
            let response = await fetch(artistTOP_TRACKSUrl, options);
            await checkForAccessTokenExpiredResponse(response);
            const artistsTOP_TRACKSResponse = await response!.json(); 
            console.log(`ARTIST TOP TRACKS RESPONSE: ${JSON.stringify(artistsTOP_TRACKSResponse)}`);
            const artistsTOP_TRACKSArray = artistsTOP_TRACKSResponse.tracks;
            artistTOP_TRACKSURIs.push(artistsTOP_TRACKSArray[0].uri);
            artistTOP_TRACKSURIs.push(artistsTOP_TRACKSArray[1].uri);
    }
    return artistTOP_TRACKSURIs;
}

async function retrieveTopTrackURIs(): Promise<PlaylistItems> {
    let localToken = localStorage.getItem('spotify_access_token');
        const url = `${USERS_TOP_ITEMS_BASE_URI}tracks`
        const options = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${localToken}`}
        }
        let response = await fetch(url, options);
        await checkForAccessTokenExpiredResponse(response);
        const TOP_TRACKSResponse = await response!.json() as UsersTopItems; 
        console.log('TOP TRACKS RESPONSE: ' + JSON.stringify(TOP_TRACKSResponse));
        let TOP_TRACKSItems = TOP_TRACKSResponse.items;
        await verifyTopItemsIsPopulated(TOP_TRACKSItems, 'top tracks');
        TOP_TRACKSItems = [...new Set(TOP_TRACKSItems)];
        let TOP_TRACKSURIs = TOP_TRACKSItems.map(item => item.uri);
        return {
            seedType: TOP_TRACKS,
            uris: TOP_TRACKSURIs
        }
}

async function retrieveNewTrackURIs(): Promise<PlaylistItems> {
        let NEW_RELEASESAlbumIds = await retrieveNEW_RELEASES();
        console.log(`NEW RELEASES ALBUM IDS: ${NEW_RELEASESAlbumIds}`);
        let NEW_RELEASESTracksURIs = await retrieveTrackURIsFromAlbums(NEW_RELEASESAlbumIds);
        return {
            seedType: NEW_RELEASES,
            uris: NEW_RELEASESTracksURIs
        }
}

async function retrieveNEW_RELEASES(): Promise<string> {
    let localToken = localStorage.getItem('spotify_access_token');
    const NEW_RELEASESUrl = 'https://api.spotify.com/v1/browse/new-releases?limit=20'
    const options = {
        method: 'GET',
        headers: {'Authorization': `Bearer ${localToken}`}
    }
    let response = await fetch(NEW_RELEASESUrl, options);
    await checkForAccessTokenExpiredResponse(response);
    const NEW_RELEASESResponse = await response!.json() as NewReleases; 
    console.log('NEW RELEASES RESPONSE: ' + JSON.stringify(NEW_RELEASESResponse));
    let newReleasesResponseItems = NEW_RELEASESResponse.albums.items;
    verifyNEW_RELEASESItemsIsPopulated(newReleasesResponseItems);
    return newReleasesResponseItems.map(newAlbum => newAlbum.id)
    .map(id => String(id)).join(',');
}

async function retrieveTrackURIsFromAlbums(NEW_RELEASESAlbumIds: string): Promise<string[]> {
    let localToken = localStorage.getItem('spotify_access_token');
    const getSeveralAlbumsUrl = `https://api.spotify.com/v1/albums?ids=${NEW_RELEASESAlbumIds}`;
    const options = {
        method: 'GET',
        headers: {'Authorization': `Bearer ${localToken}`}
    }
    let response = await fetch(getSeveralAlbumsUrl, options);
    await checkForAccessTokenExpiredResponse(response);
    const getSeveralAlbumsResponse = await response!.json() as Albums;
    console.log('GET SEVERAL ALBUMS RESPONSE: ' + JSON.stringify(getSeveralAlbumsResponse));
    const albums = getSeveralAlbumsResponse.albums;
    console.log(`ALBUMS ARRAY: ${JSON.stringify(albums)}`);
    let newTrackURIs: string[] = [];
    for (let index = 0; index < albums.length; index++) {
        const album = albums[index];
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
        throw new NoTopItemsError(`You do not have any ${topItemType}. Listen to some music on Spotify, then come back when you have some top items!`);
    }
}

async function verifyNEW_RELEASESItemsIsPopulated(items: NewReleasesAlbum[]): Promise<void> {
    if (!items || items.length === 0) {
        console.error('No new releases were returned');
        throw new NoNewReleasesError('No new releases were returned. Please try another option to generate a playlist.')
    }
}

async function checkForAccessTokenExpiredResponse(response: Response) {
    if (response.status === 401) {
        throw new AccessTokenExpiredError('Access token has expired. Please reauthenticate');
    }
}

async function retrieveUserId(): Promise<string> {
    let localToken = localStorage.getItem('spotify_access_token');
        const url = USER_PROFILE_URI;
        const options = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${localToken}`}
        }
        let response = await fetch(url, options);
        await checkForAccessTokenExpiredResponse(response);
        const userProfileResponse = await response!.json();
        return userProfileResponse.id; 
}

async function postPlaylist(userId: string, formData: PlaylistFormData): Promise<string> {
    let localToken = localStorage.getItem('spotify_access_token');
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
        await checkForAccessTokenExpiredResponse(response);
        const postPlaylistResponse = await response!.json();
        return postPlaylistResponse.id; 
}

async function populatePlaylist(playlistId: string, playlistItems: PlaylistItems): Promise<void> {
    let localToken = localStorage.getItem('spotify_access_token');
        const url = 'https://api.spotify.com/v1/playlists/{playlist_id}/tracks'.replace('{playlist_id}', playlistId);
        const options = {
            method: 'POST',
            headers: {'Authorization': `Bearer ${localToken}`},
            body: JSON.stringify({
                uris: playlistItems.uris
            })
        }
        let response = await fetch(url, options);
        await checkForAccessTokenExpiredResponse(response);
        await response!.json();
}

export async function getCreatedPlaylist(playlistId: string): Promise<Playlist> {
    let localToken = localStorage.getItem('spotify_access_token');
    const url = 'https://api.spotify.com/v1/playlists/{playlist_id}'.replace('{playlist_id}', playlistId);
    const options = {
        method: 'GET',
        headers: {'Authorization': `Bearer ${localToken}`}
    }
    let response = await fetch(url, options);
    await checkForAccessTokenExpiredResponse(response);
    let playlist = await response!.json() as Playlist;
    return await mapCreatedPlaylistTrackList(playlist);
}

async function mapCreatedPlaylistTrackList(playlist: Playlist): Promise<Playlist> {
    console.log(`TRACKS OBJECT OF CREATED PLAYLIST THAT WAS RETRIEVED: ${JSON.stringify(playlist.tracks)}`);
    console.log(`ITEMS ARRAY IN THE TRACK OBJECT OF CREATED PLAYLIST THAT WAS RETRIEVED: ${JSON.stringify(playlist.tracks.items)}`);
    let playlistTracks = playlist.tracks.items;
    if (playlist.tracks.total > PLAYLIST_TRACK_LIST_SAMPLE_SIZE) {
        playlistTracks = playlistTracks.slice(0, 10);
    }
    return await assignIdsToPlaylistTracks(playlist, playlistTracks);
}

async function assignIdsToPlaylistTracks(playlist: Playlist, playlistTracks: PlaylistTrack[]) {
    for (let index = 0; index < playlistTracks.length; index++) {
        let playlistTrack = playlistTracks[index];
        playlistTrack.track.id = index + 1; 
        console.log(`PLAYLIST TRACK OBJECT ID: ${playlistTrack.track.id}`);
    }
    playlist.tracks.items = playlistTracks;
    console.log('RETURNING MAPPED PLAYLIST AFTER ASSIGNING IDS TO THE TRACK OBJECTS');
    return playlist; 
}