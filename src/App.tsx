import "./App.css";
import CameraComponent from "./components/camera";
import CameraToggleComponent from "./components/home";
import { Toaster } from "./components/ui/toaster";

function App() {
    return (
        <>
            <Toaster />
            {/* <CameraComponent /> */}
            <CameraToggleComponent />
        </>
    );
}

export default App;
