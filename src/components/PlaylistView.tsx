import React from 'react';
import { useEffect, useState } from 'react';
import { getCreatedPlaylist } from '../service/SpotifyService';
import AccessTokenExpiredError from '../classes/errors/AccessTokenExpiredError';
import ErrorMessages from './ErrorMessages';
import { useParams, useNavigate } from 'react-router-dom';

const PlaylistView: React.FC = (): JSX.Element => {
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [isTokenExpired, setIsTokenExpired] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlaylist = async () => {
            setIsLoading(true);
            setErrorMessage('');
            try {
                const retrievedPlaylist = await getCreatedPlaylist(playlistId!);
                console.log(`RETRIEVED PLAYLIST: ${JSON.stringify(retrievedPlaylist)}`);
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
    if (playlistId) {
    fetchPlaylist();
    }
    }, [playlistId]);

     return (
        <>
            {errorMessage ? (
                <ErrorMessages message={errorMessage} isTokenExpired={isTokenExpired} />
            ) : isLoading ? (
                <div className="text-center">Loading...</div>
            ) : (
            playlist && (
            <>
            <button onClick={() => navigate('/form')}className="transition-all duration-300 hover:bg-slate-500 rounded-full p-3 text-lg font-semibold mt-3">
            Generate Another Playlist
            </button>
            <header className="text-3xl font-semibold font-serif mb-6 text-center">
                {playlist.name}
            </header>
        <div className="border-2 border-white p-5 rounded-none shadow-lg mb-5 font-serif flex flex-col items-center">
                <header className="text-2xl mb-6">{playlist.description}</header>
                <div className="mb-6">
                    <img 
                    src={playlist.images[0].url} 
                    alt="Albums that the playlist was created from"/>
                </div>
            <div className="mb-6">
            <header className="text-xl mb-4 -ml-4">Tracks: </header>
            <ol className="list-decimal text-lg">
                {playlist.tracks.items.map((playlistTrack) => (
                    <li key={playlistTrack.track.id}>
                        {playlistTrack.track.name}
                    </li>
                ))}
            </ol>
            </div>
            <div>
                <a className="transition-all duration-300 hover:bg-slate-500 rounded-full p-3 text-lg font-semibold mt-3" href={playlist.external_urls.spotify}>
                View on Spotify 
                </a>
            </div>
        </div>
            </>
            )
            )}
        </>
    );
};

export default PlaylistView;