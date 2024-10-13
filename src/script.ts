import { redirectToAuthCodeFlow, getAccessToken } from "./authorizationService.ts";
import { fetchProfile, fetchTopArtists, fetchArtistRecommendations, fetchArtistsFromArtistIds } from "./spotifyAdapter.ts";
import { populateUI } from "./userInterfaceService.ts";

const clientId = import.meta.env.VITE_CLIENT_ID;
const params = new URLSearchParams(window.location.search);
const authorizationCode = params.get("code");

if (!authorizationCode) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, authorizationCode);
    const profile = await fetchProfile(accessToken);
    const usersTopArtists = await fetchTopArtists(accessToken);
    const recommendations = await fetchArtistRecommendations(accessToken, usersTopArtists);
    const artists = await fetchArtistsFromArtistIds(accessToken, recommendations);
    populateUI(profile, artists);
}