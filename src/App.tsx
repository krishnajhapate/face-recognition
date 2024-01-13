import "./App.css";
import CameraComponent from "./components/camera";
import { Toaster } from "./components/ui/toaster";

function App() {
    return (
        <>
            <Toaster />
            <CameraComponent />
        </>
    );
}

export default App;
