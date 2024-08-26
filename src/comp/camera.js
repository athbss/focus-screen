import React, { useRef, useEffect } from 'react';

const CameraComponent = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    let video = videoRef.current;
                    video.srcObject = stream;
                    video.play();
                })
                .catch(err => {
                    console.error("Error accessing the camera: ", err);
                });
        }
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <video ref={videoRef} className="w-full h-full object-cover" />
        </div>
    );
};

export default CameraComponent;