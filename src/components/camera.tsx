import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

const CameraComponent: React.FC = () => {
    const [stream1, setStream1] = useState<MediaStream | null>(null);
    const [stream2, setStream2] = useState<MediaStream | null>(null);
    const [image1, setImage1] = useState<File | null>(null);
    const [image2, setImage2] = useState<File | null>(null);
    const [capturedImage1, setCapturedImage1] = useState<string | null>(null);
    const [capturedImage2, setCapturedImage2] = useState<string | null>(null);
    const videoRef1 = useRef<HTMLVideoElement>(null);
    const videoRef2 = useRef<HTMLVideoElement>(null);

    const { toast } = useToast();

    const openCamera = async (
        videoRef: React.RefObject<HTMLVideoElement>,
        setStream: React.Dispatch<React.SetStateAction<MediaStream | null>>
    ) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            setStream(stream);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
        }
    };

    const captureImage = (
        videoRef: React.RefObject<HTMLVideoElement>,
        setImage: React.Dispatch<React.SetStateAction<File | null>>,
        setCapturedImage: React.Dispatch<React.SetStateAction<string | null>>,
        setStream: React.Dispatch<React.SetStateAction<MediaStream | null>>
    ) => {
        if (videoRef.current) {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            if (context) {
                context.drawImage(
                    videoRef.current,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                // Convert the captured image to a File object
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "captured-image.png");
                        setImage(file);
                        setCapturedImage(URL.createObjectURL(blob)); // Set captured image for display
                        setStream(null); // Stop the video stream
                    }
                }, "image/png");
            }
        }
    };

    const resetImage = (
        setImage: React.Dispatch<React.SetStateAction<File | null>>,
        setCapturedImage: React.Dispatch<React.SetStateAction<string | null>>,
        setStream: React.Dispatch<React.SetStateAction<MediaStream | null>>
    ) => {
        setImage(null);
        setCapturedImage(null);
        setStream(null); // Stop the video stream
    };

    const verifyImages = async () => {
        if (image1 && image2) {
            try {
                // Create FormData object and append images
                const formData = new FormData();
                formData.append("image1", image1);
                formData.append("image2", image2);

                // Call your API with FormData
                const response = await fetch(
                    "http://127.0.0.1:5000/api-micro/verify-with-image",
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                const result = await response.json();
                if (result.result === "No match.") {
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Face not matched.",
                    });
                } else if (result.result === "Face match!") {
                    toast({
                        variant: "success",
                        title: "Hooray! Face  matched.",
                    });
                }
                console.log(result); // Handle the API response
            } catch (error) {
                console.error("Error calling API:", error);
            }
        }
    };

    return (
        <div className="grid p-10 justify-center text-center h-screen w-screen md:grid-cols-2 gap-5 bg-gradient-to-r from-teal-200 to-lime-200">
            <div className="">
                <h2>Camera 1</h2>
                <div className="my-2">
                    {capturedImage1 ? (
                        <img
                            src={capturedImage1}
                            alt="Captured Image 1"
                            className="mb-3 shadow-lg rounded"
                            style={{ width: "100%", maxWidth: "600px" }}
                        />
                    ) : (
                        <video
                            className="mb-3 shadow-lg rounded"
                            ref={videoRef1}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: "100%", maxWidth: "600px" }}
                        />
                    )}
                </div>
                {!stream1 && !capturedImage1 && (
                    <Button onClick={() => openCamera(videoRef1, setStream1)}>
                        Open Camera 1
                    </Button>
                )}

                {!capturedImage1 ? (
                    stream1 && (
                        <Button
                            onClick={() =>
                                captureImage(
                                    videoRef1,
                                    setImage1,
                                    setCapturedImage1,
                                    setStream1
                                )
                            }
                        >
                            Capture
                        </Button>
                    )
                ) : (
                    <Button
                        onClick={() => {
                            openCamera(videoRef1, setStream1);
                            resetImage(
                                setImage1,
                                setCapturedImage1,
                                setStream1
                            );
                        }}
                    >
                        Capture Again
                    </Button>
                )}
            </div>
            <div className=" ">
                <h2>Camera 2</h2>

                <div className=" my-2">
                    {capturedImage2 ? (
                        <img
                            src={capturedImage2}
                            alt="Captured Image 2"
                            className="mb-3 shadow-lg rounded"
                            style={{ width: "100%", maxWidth: "600px" }}
                        />
                    ) : (
                        <video
                            className="mb-3 shadow-lg rounded"
                            ref={videoRef2}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: "100%", maxWidth: "600px" }}
                        />
                    )}
                </div>

                {!stream2 && !capturedImage2 && (
                    <Button onClick={() => openCamera(videoRef2, setStream2)}>
                        Open Camera 2
                    </Button>
                )}

                {!capturedImage2 ? (
                    stream2 && (
                        <Button
                            onClick={() =>
                                captureImage(
                                    videoRef2,
                                    setImage2,
                                    setCapturedImage2,
                                    setStream2
                                )
                            }
                        >
                            Capture
                        </Button>
                    )
                ) : (
                    <Button
                        onClick={() => {
                            openCamera(videoRef2, setStream2);
                            resetImage(
                                setImage2,
                                setCapturedImage2,
                                setStream2
                            );
                        }}
                    >
                        Capture Again
                    </Button>
                )}
            </div>

            {image1 && image2 && (
                <Button
                    variant={"destructive"}
                    className="w-full mx-auto col-span-2"
                    onClick={verifyImages}
                >
                    Verify
                </Button>
            )}
        </div>
    );
};

export default CameraComponent;
