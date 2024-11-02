interface UsersTopItems {
    items: TopArtist[] | TopTrack[];
}

interface TopArtist {
    type: string; // the object type; allowed values are 'artist' and 'track' 
    id: string; // the Spotify ID of the artist or track, depending on the object type 
    genres: string[];
}

interface TopTrack {
    type: string;
    id: string;
}

