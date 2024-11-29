interface UsersTopItems {
    items: TopArtist[] | TopTrack[];
}

interface TopArtist {
    type: string; // the object type; allowed values are 'artist' and 'track' 
    id: string; // id of the artist that is used to retrieve their top tracks
    uri: string; // the Spotify URI of the artist or track, depending on the object type 
    genres: string[];
}

interface TopTrack {
    type: string;
    uri: string;
}

interface NewReleases {
    albums: NewAlbums;
}

interface NewAlbums {
    items: NewAlbum[];
}

interface NewAlbum {
    id: string;
}

interface Album {
    tracks: Tracks;
}

interface Tracks {
    total: number;
    items: Track[];
}

interface Track {
    uri: string;
}

type PlaylistFormData = {
    playlistName: string;
    playlistSeed: string;
    isPublic: boolean;
    playlistDescription: string;
}

type PlaylistItems = {
    seedType: 'top-artists' | 'top-tracks' | 'new-releases';
    uris: string[];
}
