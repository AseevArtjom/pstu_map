import { useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import DesktopLayout from "./layouts/DesktopLayout.tsx";
import MobileLayout from "./layouts/MobileLayout.tsx";
import './App.css';

function App() {
    const isMobile = useMediaQuery("(max-width:768px)");

    const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

    const handleSelectBuilding = (buildingId: string) => {
        setSelectedBuilding(buildingId);
        setSelectedFloor(1);
    };

    const handleBackToGlobalMap = () => {
        setSelectedBuilding(null);
        setSelectedFloor(null);
    };

    const sharedNavigationProps = {
        selectedBuilding,
        setSelectedBuilding,
        selectedFloor,
        setSelectedFloor,
        hoveredBuilding,
        setHoveredBuilding,
        handleSelectBuilding,
        handleBackToGlobalMap,
    };

    return (
        <>
            {isMobile ? (
                <MobileLayout {...sharedNavigationProps} />
            ) : (
                <DesktopLayout {...sharedNavigationProps} />
            )}
        </>
    );
}

export default App;