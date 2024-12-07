import React from 'react';
import { useEffect, useState } from 'react';
import { getCreatedPlaylist } from '../service/SpotifyService';
import AccessTokenExpiredError from '../classes/errors/AccessTokenExpiredError';
import ErrorMessages from './ErrorMessages';

const PlaylistView: React.FC<PlaylistViewProps> = (props: PlaylistViewProps): JSX.Element => {
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [isTokenExpired, setIsTokenExpired] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchPlaylist = async () => {
            setIsLoading(true);
            setErrorMessage('');
            try {
                const retrievedPlaylist = await getCreatedPlaylist(props.playlistId);
                setPlaylist(retrievedPlaylist);
            } catch (error) {
                if (error instanceof AccessTokenExpiredError) {
                    setErrorMessage(error.message);
                    setIsTokenExpired(true);
                } else {
                    setErrorMessage('An unexpected error occurred.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylist();
    }, [props.playlistId]);

     return (
        <>
            {errorMessage ? (
                <ErrorMessages message={errorMessage} isTokenExpired={isTokenExpired} />
            ) : isLoading ? (
                <div className="text-center">Loading...</div>
            ) : (
            playlist && (
            <>
            <header className="text-xl font-semibold font-serif mb-6 text-center">
                {playlist.name}
            </header>
            <div className="border-2 border-white p-5 rounded-none shadow-lg mb-5 font-serif flex flex-col items-center">
                <header className="text-lg mb-6">{playlist.description}</header>
                <div className="mb-6">
                    <img 
                    src={playlist.images[0].url} 
                    alt="Albums that the playlist was created from"/>
                </div>
                <div>
                <header className="text-lg mb-6">Tracks: </header>
                    {playlist.tracks.items.slice(0,9).map((track, index) => (
                        <ol type="1">
                            <li 
                            key={index}
                            value={index}
                            >{track.name}
                            </li>
                        </ol>
                    ))}
                </div>
            </div>
            </>
            )
            )}
        </>
    );
};

export default PlaylistView;