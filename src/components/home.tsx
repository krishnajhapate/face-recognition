import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import FaceCaptureComponent from "./faceadd";
import CameraVerificationComponent from "./verify";
import { Toaster } from "react-hot-toast";

export const baseurl: string = "https://test.peaksender.com";
// export const baseurl: string = "http://localhost:5001";

const CameraToggleComponent: React.FC = () => {
    const [isVerifying, setIsVerifying] = useState(true);
    const [userIds, setUserIds] = useState<string[]>([]);

    const handleToggle = () => {
        setIsVerifying(!isVerifying);
    };

    useEffect(() => {
        // Fetch user IDs from your backend API
        const fetchUserIds = async () => {
            try {
                const response = await fetch(baseurl + "/all-image-ids");
                const data = await response.json();
                setUserIds(data.image_ids);
            } catch (error) {
                console.error("Error fetching user IDs:", error);
            }
        };

        fetchUserIds();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Toaster />

            <div className="mb-5">
                <Button onClick={() => handleToggle()}>
                    {isVerifying
                        ? "Switch to Add Face"
                        : "Switch to Verify Face"}
                </Button>
            </div>

            {isVerifying ? (
                <CameraVerificationComponent userIds={userIds} />
            ) : (
                <FaceCaptureComponent />
            )}
        </div>
    );
};

export default CameraToggleComponent;
