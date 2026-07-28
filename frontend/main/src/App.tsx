import useMediaQuery from "@mui/material/useMediaQuery";
import DesktopLayout from "./layouts/DesktopLayout.tsx";
import MobileLayout from "./layouts/MobileLayout.tsx";
import './App.css';

function App() {
    const isMobile = useMediaQuery("(max-width:768px)");

    return (
        <>
            {isMobile ? (
                <MobileLayout/>
            ) : (
                <DesktopLayout/>
            )}
        </>
    );
}

export default App;