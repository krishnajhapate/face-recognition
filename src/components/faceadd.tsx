import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { baseurl } from "./home";
import toast, { Toaster } from "react-hot-toast";

const FaceCaptureComponent: React.FC = () => {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isImageCaptured, setIsImageCaptured] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setIsCameraOpen(true);
        } catch (error) {
            console.error("Error accessing camera:", error);
        }
    };

    const captureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (context) {
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;

                context.drawImage(
                    videoRef.current,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                // Convert the captured image to a Data URL
                const imageDataURL = canvas.toDataURL("image/png");
                setCapturedImage(imageDataURL);
                setIsImageCaptured(true);
            }
        }
    };

    const sendImageToBackend = async () => {
        setLoading(true);
        try {
            // Convert Data URL to Blob
            const base64Data = capturedImage?.split(",")[1];
            if (!base64Data) {
                console.error("Invalid Data URL");
                return;
            }

            const blob = await fetch(
                `data:image/png;base64,${base64Data}`
            ).then((res) => res.blob());

            // Create FormData object and append the image
            const formData = new FormData();
            formData.append("image", blob, "captured-image.png");

            // Call your backend API to store the image
            const response = await fetch(baseurl + "/upload-image", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            console.log(result); // Handle the backend API response

            if (response.ok) {
                toast.success("Face added successfully!");
                toast("Your id is " + result.image_id);
            } else {
                toast.error("Error adding face.");
            }
            setTimeout(() => {
                window.location.reload();
            }, 5000);
            setCapturedImage(null);
            setIsCameraOpen(false);
        } catch (error) {
            console.error("Error sending image to the backend:", error);
            toast.error("Error adding face.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-center">
            <h2>Face Capture</h2>
            <div className="my-2">
                {capturedImage ? (
                    <img
                        src={capturedImage}
                        alt="Captured Image"
                        className="mb-3 shadow-lg rounded"
                        style={{ width: "100%", maxWidth: "600px" }}
                    />
                ) : (
                    <>
                        <video
                            className="mb-3 shadow-lg rounded"
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: "100%", maxWidth: "600px" }}
                        />
                    </>
                )}
            </div>

            {!isImageCaptured && !isCameraOpen ? (
                <Button onClick={() => openCamera()}>Open Camera</Button>
            ) : !isImageCaptured ? (
                <Button onClick={() => captureImage()}>Capture</Button>
            ) : (
                <Button
                    disabled={isLoading}
                    onClick={() => sendImageToBackend()}
                >
                    Add Face
                </Button>
            )}

            <Toaster />
        </div>
    );
};

export default FaceCaptureComponent;
