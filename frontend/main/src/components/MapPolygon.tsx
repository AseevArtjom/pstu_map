import EntityPolygon from "./EntityPolygon.tsx";

interface MapPolygonProps {
    building: any;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
}

export default function MapPolygon({ building, isHovered, onMouseEnter, onMouseLeave, onClick }: MapPolygonProps) {
    return (
        <EntityPolygon
            id={building.id}
            dataAttribute="data-building-id"
            points={building.mapPolygon}
            color={building.hex_color}
            isHovered={isHovered}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        />
    );
}