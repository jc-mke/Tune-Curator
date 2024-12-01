import React from 'react';
import { useEffect, useState } from 'react';
import { getCreatedPlaylist } from '../service/SpotifyService';

const PlaylistView: React.FC<PlaylistViewProps> = (props): JSX.Element => {
    const [retrievedPlaylist, setRetrievedPlaylist] = useState({});
    useEffect(() => {
        const playlist = getCreatedPlaylist(props.playlistId);
        setRetrievedPlaylist(playlist);
    }, [props.playlistId]);

    return (
        <header className="text-xl font-semibold font-serif mb-6 text-center">
        {retrievedPlaylist.name}
      </header>
    );
};

export default PlaylistView;