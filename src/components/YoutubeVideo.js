
"use client";


import React, { useState, useEffect } from 'react';
import Script from 'next/script';

// const KEY = process.env.NEXT_PUBLIC_API_KEY;

const YouTubeComponent = () => {
    const [videos, setVideos] = useState([]);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [player, setPlayer] = useState(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);


    useEffect(() => {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const queryParam = urlSearchParams.get('query');
        const startTimeParam = urlSearchParams.get('starttime');
        const endTimeParam = urlSearchParams.get('endtime');

        if (queryParam && startTimeParam && endTimeParam) {
            setStartTime(parseInt(startTimeParam));
            setEndTime(parseInt(endTimeParam));
            fetchVideos(queryParam);
        }
    }, []);

    const fetchVideos = async (searchQuery) => {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5000&q=${searchQuery}&key=AIzaSyAppEtM-fM7RJtJIlEOT8OfJII1qX96R6g`
        );
        const data = await response.json();
        setVideos(data.items);

    };

    const handleVideoError = (event) => {
        if (event.data === 150) {
            if (currentVideoIndex < videos.length - 1) {
                setCurrentVideoIndex(prevIndex => prevIndex + 1);  // Load next video
            }
        }
    };

    const handleStateChange = (event) => {
        if (event.data === window.YT.PlayerState.ENDED) {
            if (currentVideoIndex < videos.length - 1) {
                setCurrentVideoIndex(prevIndex => prevIndex + 1);
            } else {
                setCurrentVideoIndex(0); // loop back to the first video
            }
        }
    };

    useEffect(() => {
        if (typeof window.YT !== "undefined" && videos[currentVideoIndex]) {
            const currentVideo = videos[currentVideoIndex];
            if (!player) {
                const newPlayer = new window.YT.Player('youtube-player', {
                    videoId: currentVideo.id.videoId,
                    playerVars: {
                        start: startTime,
                        end: endTime,
                        autoplay: 1
                    },
                    events: {
                        onReady: (event) => {
                            event.target.playVideo();
                            setPlayer(event.target);
                        },
                        onError: handleVideoError,
                        onStateChange: handleStateChange
                    }
                });
                setPlayer(newPlayer);
            } else if (player && typeof player.loadVideoById === 'function') {
                player.loadVideoById({
                    videoId: currentVideo.id.videoId,
                    startSeconds: startTime,
                    endSeconds: endTime
                });
            }
        }
    }, [videos, currentVideoIndex, player, startTime, endTime]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (player && player.getCurrentTime) {
                const newCurrentTime = player.getCurrentTime();
                setCurrentTime(newCurrentTime);
                if (newCurrentTime >= endTime) {
                    if (currentVideoIndex < videos.length - 1) {
                        setCurrentVideoIndex(prevIndex => prevIndex + 1);
                    } else {
                        setCurrentVideoIndex(0); // loop back to the first video
                    }
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [player, endTime, currentVideoIndex, videos]);



    return (
        <>
            <Script
                src="https://www.youtube.com/iframe_api"
                strategy="afterInteractive"
                onLoad={() => {
                    if (window.YT && window.YT.Player) {
                        initializePlayer();
                    }
                }}
            />
            <div className="youtube-component">
                <div id="youtube-player"></div>

            </div>
        </>
    );
};

export default YouTubeComponent;
