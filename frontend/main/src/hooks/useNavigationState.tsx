import {useState} from "react";

export function useNavigationState() {
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

  return {
    selectedBuilding,
    selectedFloor,
    hoveredBuilding,
    setHoveredBuilding,
    setSelectedFloor,
    handleSelectBuilding,
    handleBackToGlobalMap
  };
}