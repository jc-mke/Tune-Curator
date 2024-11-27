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

type PlaylistFormData = {
    playlistSeed: string;
}

type PlaylistItems = {
    seedType: 'top-artists' | 'top-tracks';
    uris: string[];
}
