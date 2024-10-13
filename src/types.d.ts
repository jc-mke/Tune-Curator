interface UserProfile {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
        filter_enabled: boolean,
        filter_locked: boolean
    },
    external_urls: { spotify: string; };
    followers: { href: string; total: number; };
    href: string;
    id: string;
    images: Image[];
    product: string;
    type: string;
    uri: string;
}

interface Image {
    url: string;
    height: number;
    width: number;
}

interface TopArtists {
    items: TopArtist[];
}

interface TopArtist {
    external_urls: { spotify: string; };
    followers: { href: string; total: number; };
    genres: string[];
    href: string;
    id: string; 
    images: Image[];
    name: string; 
    popularity: number;
    type: string;
    uri: string; 
}

interface Recommendations {
    tracks: Track[];
}

interface Track {
    artists: TrackArtist[];
}

interface TrackArtist {
    href: string;
    id: string;
    name: string;
}

interface Artists {
    artists: Artist[];
}

interface Artist {
    name: string;
    external_urls: {
        spotify: string;
    },
    images: Image[];
    genres: string[];
}