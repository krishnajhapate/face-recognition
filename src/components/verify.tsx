import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { baseurl } from "./home";
import toast from "react-hot-toast";

interface CameraComponentProps {
    userIds: string[]; // List of user IDs to be matched
}

const CameraVerificationComponent: React.FC<CameraComponentProps> = ({
    userIds,
}) => {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isFaceVerified, setIsFaceVerified] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    let captureInterval: NodeJS.Timeout;

    let attempts = 0;

    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            // Set up periodic image capture
            captureInterval = setInterval(() => {
                console.log("Capturing image...");
                captureImage();
                attempts++;
            }, 2000);
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
                setIsFaceVerified(false);
                if (!isFaceVerified && selectedUserId) {
                    sendVerificationRequest(imageDataURL, selectedUserId);
                }
            }
        }
    };

    const sendVerificationRequest = async (
        imageDataURL: string,
        userId: string
    ) => {
        try {
            // Convert Data URL to Blob
            const base64Data = imageDataURL.split(",")[1];
            const blob = await fetch(
                `data:image/png;base64,${base64Data}`
            ).then((res) => res.blob());

            // Create FormData object and append the image
            const formData = new FormData();
            formData.append("image", blob, "captured-image.png");
            formData.append("image_id", userId);

            // Call your backend API to verify the image
            const response = await fetch(baseurl + "/verify-with-id", {
                method: "POST",
                body: formData,
            });

            if (response.status === 200) {
                clearInterval(captureInterval);
                setIsFaceVerified(true);
                toast.success("Face Verified");

                setTimeout(() => {
                    toast.success("Face Verification completed");
                    window.location.reload();
                }, 5000);
            } else {
                if (attempts >= 4) {
                    clearInterval(captureInterval);
                    toast.error("Exceeded maximum attempts. Refresh the page.");
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    // Optionally, you can trigger a page refresh here
                } else {
                    toast.error("Face not matched! Attempt #" + (attempts ));
                }
            }
        } catch (error) {
            toast.error("Face not matched!");
            console.error("Error sending verification request:", error);
        }
    };

    useEffect(() => {
        // Cleanup function to clear the interval when the component is unmounted
        return () => {
            clearInterval(captureInterval);
        };
    }, []);

    return (
        <div className="text-center">
            <h2>Camera Verification</h2>

            <div className="my-3">
                <label>Select User ID: </label>
                <select
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    value={selectedUserId || ""}
                >
                    <option value="" disabled>
                        Select an ID
                    </option>
                    {userIds.map((id) => (
                        <option key={id} value={id}>
                            {id}
                        </option>
                    ))}
                </select>
            </div>

            <div className="my-2">
                <video
                    className="mb-3 shadow-lg rounded"
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: "100%", maxWidth: "600px" }}
                />
            </div>

            {!capturedImage && (
                <Button onClick={() => openCamera()} disabled={!selectedUserId}>
                    Open Camera
                </Button>
            )}
        </div>
    );
};

export default CameraVerificationComponent;
