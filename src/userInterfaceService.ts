export function populateUI(profile: UserProfile, recommendedArtists: Artists): void {
    populateUserProfileInUI(profile);
    populateRecommendedArtistsInUI(recommendedArtists);
}

function populateUserProfileInUI(profile: UserProfile) {
    const userProfileWrapper = document.createElement('div');
    userProfileWrapper.className = "transition-all duration-300 hover:bg-slate-500 p-2 rounded-full flex items-center"; 
    
    if (profile.images[0]) {
        let userProfileLink = document.createElement('a');
        userProfileLink.href = profile.external_urls.spotify;
        userProfileLink.target = "_blank";
        
        const profileImage = new Image(50, 50);
        profileImage.src = profile.images[0].url;
        profileImage.alt = `Spotify profile image of the user: ${profile.display_name}`;
        profileImage.className = "rounded-full border border-gray-400 mr-2";

        
        userProfileLink.appendChild(profileImage);
        userProfileWrapper.appendChild(userProfileLink);
    }

    const userProfileName = document.getElementById("displayName");
    userProfileName!.innerText = profile.display_name;

    if (userProfileName) userProfileWrapper.appendChild(userProfileName);

    const avatarContainer = document.getElementById("avatar");
    avatarContainer!.appendChild(userProfileWrapper);
}


function populateRecommendedArtistsInUI(recommendedArtists: Artists):void {
    const artistContainerRoleMap= new Map([
        [0, "artistOne"],
        [1, "artistTwo"],
        [2, "artistThree"],
        [3, "artistFour"],
        [4, "artistFive"],
    ]);

    for (let index = 0; index < recommendedArtists.artists.length; index++) {
        const recommendedArtist = recommendedArtists.artists[index];
        let artistContainerRole = artistContainerRoleMap.get(index);

        const artistContainer = document.querySelector(`div[role="${artistContainerRole}"]`);

        artistContainer!.className = "flex flex-col items-center mb-4 w-1/3"; 
        if (index >= 3) {
            artistContainer!.className = "flex flex-col items-center mb-4 w-1/2"; 
        }

        const artistCardWrapper = document.createElement('div');
        artistCardWrapper.className = "transition-all duration-300 hover:bg-slate-500 rounded-lg p-4 flex flex-col items-center";

        const artistImage = document.createElement('img');
        artistImage.src = recommendedArtist.images[0].url;
        artistImage.alt = `Image of: ${recommendedArtist.name}`;
        artistImage.className = "rounded-full border border-gray-400 w-64 h-64 transition-all duration-300 hover:w-72 hover:h-72";

        const artistName = document.createElement('span');
        artistName.className = "font-bold font-serif text-lg";
        artistName.innerText = recommendedArtist.name;

        const artistGenre = document.createElement('span');
        artistGenre.className = "text-gray-400 text-sm";
        artistGenre.innerText = recommendedArtist.genres[0];

        artistCardWrapper.appendChild(artistImage);
        artistCardWrapper.appendChild(artistName);
        artistCardWrapper.appendChild(artistGenre);

        const artistLink = document.createElement('a');
        artistLink.href = recommendedArtist.external_urls.spotify;
        artistLink.target = "_blank";

        artistLink.appendChild(artistCardWrapper);
        artistContainer!.appendChild(artistLink);
    }
}