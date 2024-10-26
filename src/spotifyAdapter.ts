export async function fetchProfile(token: string): Promise<UserProfile> {
    verifyTokenExists(token);
    
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    verify200Response(result, 'profile');

    const userProfile = await result.json();
    console.log('USER PROFILE RESPONSE: ' + JSON.stringify(userProfile));
    return userProfile;
}

export async function fetchTopArtists(token: string): Promise<TopArtists> {
    verifyTokenExists(token);

    const result = await fetch("https://api.spotify.com/v1/me/top/artists", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    verify200Response(result, 'top artists');

    const topArtists = await result.json();
    console.log('TOP ARTISTS RESPONSE: ' + JSON.stringify(topArtists));
    if (topArtists.items.length === 0) {
        console.error('The user does not have any top artists');
        throw new Error('The user does not have any top artists');
    }

    return topArtists;
} 

export async function fetchArtistRecommendations(token: string, usersTopArtists: TopArtists): Promise<TrackArtist[]> {
    verifyTokenExists(token);
    const usersTopArtistsIds = usersTopArtists.items.slice(0, 5).map(
        item => item.id
    );
    const commaSeparatedStringOfUsersTopArtistsIds = usersTopArtistsIds.map(id => String(id)).join(',');
    console.log('USER\'S TOP ARTISTS IDS AS STRING: ' + commaSeparatedStringOfUsersTopArtistsIds);
    const searchParams = `seed_artists=${commaSeparatedStringOfUsersTopArtistsIds}`;
    const result = await fetch(`https://api.spotify.com/v1/recommendations?${searchParams}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    verify200Response(result, 'recommendations');

    const recommendations = await result.json();
    if (recommendations.tracks.length === 0) {
        console.error('No recommendations were returned');
        throw new Error('No recommendations were returned');
    }
    const recommendedTracks: Track[] = recommendations.tracks; 
    // filtering out artists with IDs that match the user's top artists so that they're not included in the reccomendations
    let recommendedArtists: TrackArtist[] = recommendedTracks.map(track => track.artists[0]).filter(trackArtist => !usersTopArtistsIds.includes(trackArtist.id));
    // calling the set constructor to remove any duplicate artists, then converting back to an array to conform to the TrackArtist interface 
    recommendedArtists = [...new Set(recommendedArtists)];

    console.log('ARTISTS RETRIEVED FROM RECOMMENDATIONS RESPONSE: ' + JSON.stringify(recommendedArtists));
    return recommendedArtists;
}

export async function fetchArtistsFromArtistIds(token: string, recommendedArtists: TrackArtist[]): Promise<Artists> {
    verifyTokenExists(token);
    const artistIds = recommendedArtists.map(artist => artist.id).slice(0, 5);
    console.log('ARTIST IDS TO RETRIEVE FIVE ARTISTS TO RECOMMEND TO THE USER: ' + JSON.stringify(artistIds));
    const commaSeparatedStringOfArtistIds = artistIds.map(id => String(id)).join(',');
    const searchParams = `ids=${commaSeparatedStringOfArtistIds}`;
    const result = await fetch(`https://api.spotify.com/v1/artists?${searchParams}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    verify200Response(result, 'artists by ids');
    const artistsByIds = await result.json();
    if (artistsByIds.artists.length === 0) {
        console.error('No artists were retrieved with the ids: ' + artistIds);
        throw new Error('No artists were retrieved');
    }
    console.log('ARTISTS BY IDS RESPONSE: ' + JSON.stringify(artistsByIds));
    return artistsByIds;
}

export async function handleFormSubmit() {
    const form = document.getElementById('recommendations-form') as HTMLFormElement;

    form?.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        for (const [key, value] of formData.entries()) {
            console.log(key, value);
          }
    })
}

async function verifyTokenExists(token: string): Promise<void> {
    if (!token) {
        console.error('Access token does not exist');
        throw new Error('Access token does not exist');
    }
}

async function verify200Response(response: Response, requestType: string): Promise<void> {
    if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error fetching ${requestType}: ${JSON.stringify(errorData)}`);
        throw new Error(errorData.error.message);
    }
}