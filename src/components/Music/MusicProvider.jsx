import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio('naruto_flute.mp3');
            audioRef.current.loop = true;
            audioRef.current.volume = 0.3;
        }

        if (isMusicPlaying) {
            audioRef.current.play().catch((error) => console.error("Error playing audio:", error));
        } else {
            audioRef.current.pause();
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [isMusicPlaying]);

    const toggleMusic = () => {
        setIsMusicPlaying(prevState => !prevState);
    };

    return (
        <MusicContext.Provider value={{ isMusicPlaying, toggleMusic }}>
            {children}
        </MusicContext.Provider>
    );
};

export const playClickSound = () => {
    const audio = new Audio('/naruto_jutsu.mp3');
    audio.volume=0.1;
    audio.play();
    // audioRef.current = new Audio('naruto_jutsu.mp3');
    //         audioRef.current.volume = 0.1;
    //         audioRef.current.play()
    
};