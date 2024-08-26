import React, { useRef, useEffect } from 'react';

const CameraComponent = ({ rotationAngle }) => {
    const videoRef = useRef(null);
    const cameraStyle = {
        transform: `rotate(${rotationAngle}deg)`,
        width: '100%',
        height: '100%',
        objectFit: 'cover', // חשוב לשמור על הכיסוי של כל האזור
        transition: 'transform 0.5s ease', // הוספת אנימציה לסיבוב חלק
    };

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
            <video ref={videoRef} className="w-full h-full object-cover" style={cameraStyle} autoPlay/>
        </div>
    );
};

export default CameraComponent;