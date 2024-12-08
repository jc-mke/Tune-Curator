# Tune Curator
## Basic Functionality 
- Generates a spotify playlist for the user based on their top artists, top tracks, or new releases on Spotify. 

## Management of User Authorization 
- The app uses the implicit grant authorization method: https://developer.spotify.com/documentation/web-api/tutorials/implicit-flow 
    - This is meant to simplify the authorization process since server-side code isn't required, and I ran into issues with using the Authorization PKCE method because React renders multiple times in development mode. 
    - The drawback to this method is that it's less secure and does not allow for automatic refreshes of the access token, so the user will have to manually re-authorize access to their Spotify data if the access token expires during their session. Although this is annoying, it's unlikely to happen since the app 
    probably won't be used for more than an hour unless additional functionality is added in the future. 

## Overview of Project Structure 
- `src/classes/errors`
    - Contains classes that extend `Error` so that different actions are taken to manage the state
    in the `PlaylistForm` and `PlaylistView` components. 
        - For example, if an `AccessTokenExpired` error is thrown from the `SpotifyService`, then the `PlaylistForm` component will render a button and display a message that prompts the user to 
        authorize access to their data once more so that a new access token can be retrieved. 
- `src/components`
    - This is where all of the React functional components live: 
        - `ErrorMessages` 
            - This is a pretty simple component that is referenced by other components to render error messages
            and conditionally render a button that the user can use to navigate back to the `SpotifyAuthButton` component so that a new access token can be retrieved. 
        - `PlaylistForm`
            - This contains the Form related elements that enable the user to specify what kinds of tracks 
            their playlist will be populated with, as well as a name, optional description, and a checkbox 
            that specifies if the playlist can be viewed by other Spotify users. 
        - `PlaylistView`
            - When the user submits the form to generate a new playlist, and it's successfully created,
            they will automatically be routed to this component, which displays the following information 
            about the generaeted playlist: 
                - name 
                - description
                - images (if any)
                - first ten tracks of the playlist
                - link to the playlist in Spotify 
        - `SpotifyAuthButton` 
            - This is the first component that the user will see when they use the app. It just contains a 
            prompt and a button so that the user can authorize access to their spotify data, which enables 
            the app to access their top tracks, top artists, and to create and retrieve playlists for them. 
- `src/service`
    - `SpotifyService` 
        - This is where all of the functions that are responsible for calling the Spotify Web API are defined. They do some minimal validation of the form input and the API responses, and some transformation of the 
        data in certain cases, as well. 
- `types` 
    - This is where all of the TS type aliases and interfaces are defined. There's a lot of nested properties
    in the Spotify Web API responses, so maybe in the future it would be good to rename these to neatly label
    which ones define the structure of the API responses, and which ones are just used within various places in the app for the sake of rendering or manipulating data. 
        - For instance, the `id` attribute in the `playlistTrackObject` interface isn't actually present in the
        API response. Rather, it's populated by the `SpotifyService` to ensure the list items in the `PlaylistView` component have a unique key so that React doesn't complain. 

