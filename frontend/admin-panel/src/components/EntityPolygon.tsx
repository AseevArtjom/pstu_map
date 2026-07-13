import type { ReactNode } from "react";
import { usePolygonColors } from "../hooks/usePolygonColors.ts";

interface EntityPolygonProps {
    id: string | number;
    dataAttribute: string;
    points: string;
    color: string;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick?: () => void;
    label?: ReactNode;
}

export default function EntityPolygon({
    id, dataAttribute, points, color, isHovered,
    onMouseEnter, onMouseLeave, onClick, label
}: EntityPolygonProps) {
    const colors = usePolygonColors(color, isHovered);
    const dataProps = { [dataAttribute]: id };

    return (
        <g
            {...dataProps}
            style={{ cursor: "pointer" }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        >
            <polygon
                points={points}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isHovered ? 2.5 : 1.5}
                style={{ transition: "all 0.15s ease" }}
            />
            {label}
        </g>
    );
}