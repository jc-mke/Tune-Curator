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
    albums: NewReleasesAlbums;
}

interface NewReleasesAlbums {
    items: NewReleasesAlbum[];
}

interface NewReleasesAlbum {
    id: string;
}

interface Albums {
    albums: Album[];
}

interface Album {
    tracks: Tracks;
}

interface Tracks {
    total: number;
    items: Track[];
}

interface Track {
    name: string;
    uri: string;
    artists: PlaylistTrackArtist[];
}

interface Playlist {
    external_urls: PlaylistExternalUrl;
    images: PlaylistImage[];
    name: string;
    description: string | null;
    tracks: PlaylistTracks;
}

interface PlaylistExternalUrl {
    spotify: string;
}

interface PlaylistImage {
    url: string;
    height: string;
    width: string;
}

interface PlaylistTracks {
    total: number;
    items: PlaylistTrack[];
}

interface PlaylistTrack {
    track: PlaylistTrackObject;
}

interface PlaylistTrackObject {
    name: string;
    id: number;
}

interface PlaylistTrackArtist {
    name: string;
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

type ErrorMessagesProps = {
    message: string;
    isTokenExpired: boolean;
}
