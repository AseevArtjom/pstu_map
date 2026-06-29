import { Box } from "@mui/material";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { ReactNode } from "react";
import { useRef, useEffect, useState } from "react";
import { useAppSelector } from "../store/store.ts";
import BuildingIcon from "./BuildingIcon.tsx";

interface InteractiveMapProps {
    bgImage: string;
    children?: ReactNode;
    onDimensionsLoad?: (width: number, height: number) => void;
    isGlobalMap?: boolean;
    hoveredBuilding?: string | null;
    setHoveredBuilding?: (id: string | null) => void;
    onSelectBuilding?: (id: string) => void;
}

export default function InteractiveMap({
                                           bgImage,
                                           children,
                                           onDimensionsLoad,
                                           isGlobalMap = false,
                                           hoveredBuilding = null,
                                           setHoveredBuilding,
                                           onSelectBuilding,
                                       }: InteractiveMapProps) {
    const PADDING = 120;
    const INITIAL_SCALE = 1.2;
    const containerRef = useRef<HTMLDivElement>(null);

    const { buildings } = useAppSelector((state) => state.building);

    const [mapDimensions, setMapDimensions] = useState<{ width: number; height: number } | null>(null);
    const [initialPos, setInitialPos] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const img = new window.Image();
        img.src = bgImage;
        img.onload = () => {
            setMapDimensions({
                width: img.naturalWidth,
                height: img.naturalHeight
            });
            onDimensionsLoad?.(img.naturalWidth, img.naturalHeight);
        };
    }, [bgImage, onDimensionsLoad]);

    useEffect(() => {
        if (containerRef.current && mapDimensions) {
            const totalWidth = mapDimensions.width + PADDING * 2;
            const totalHeight = mapDimensions.height + PADDING * 2;
            const { clientWidth, clientHeight } = containerRef.current;

            const x = (clientWidth - totalWidth * INITIAL_SCALE) / 2;
            const y = (clientHeight - totalHeight * INITIAL_SCALE) / 2;

            setInitialPos({ x, y });
        }
    }, [mapDimensions]);

    if (!mapDimensions || !initialPos) {
        return (
            <Box
                ref={containerRef}
                sx={{
                    width: "100%",
                    height: "100%",
                    bgcolor: "#14161A",
                    background: "conic-gradient(rgb(20, 20, 35) 0.25turn, rgb(14, 14, 26) 0.25turn 0.5turn, rgb(20, 20, 35) 0.5turn 0.75turn, rgb(14, 14, 26) 0.75turn) 0px 0px / 40px 40px"
                }}
            />
        );
    }

    const totalWidth = mapDimensions.width + PADDING * 2;
    const totalHeight = mapDimensions.height + PADDING * 2;

    return (
        <Box
            ref={containerRef}
            sx={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: "conic-gradient(rgb(20, 20, 35) 0.25turn, rgb(14, 14, 26) 0.25turn 0.5turn, rgb(20, 20, 35) 0.5turn 0.75turn, rgb(14, 14, 26) 0.75turn) 0px 0px / 40px 40px",
                position: "relative",
            }}
        >
            <TransformWrapper
                initialPositionX={initialPos.x}
                initialPositionY={initialPos.y}
                initialScale={INITIAL_SCALE}
                minScale={INITIAL_SCALE}
                maxScale={3}
                centerOnInit={false}
                limitToBounds={true}
                panning={{ velocityDisabled: true }}
                smooth={true}
                wheel={{ disabled: false, step: 0.002 }}
                zoomAnimation={{ disabled: false, animationTime: 220, animationType: "easeOutQuad" }}
            >
                <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}
                >
                    <div style={{ width: `${totalWidth}px`, height: `${totalHeight}px`, position: "relative" }}>
                        <svg
                            width={totalWidth}
                            height={totalHeight}
                            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
                            style={{ display: "block" }}
                        >
                            <image
                                href={bgImage}
                                x={PADDING}
                                y={PADDING}
                                width={mapDimensions.width}
                                height={mapDimensions.height}
                                style={{ pointerEvents: "none" }}
                            />

                            <g transform={`translate(${PADDING}, ${PADDING})`}>
                                {isGlobalMap && buildings.map((b) => {
                                    if (!b.mapPolygon) return null;
                                    const isHovered = hoveredBuilding === b.id;

                                    return (
                                        <g key={b.id}>
                                            <polygon
                                                points={b.mapPolygon}
                                                fill={isHovered ? "rgba(47, 128, 237, 0.3)" : "rgba(47, 128, 237, 0.12)"}
                                                stroke="#2F80ED"
                                                strokeWidth={isHovered ? 2.5 : 1.5}
                                                style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                                                onMouseEnter={() => setHoveredBuilding?.(b.id)}
                                                onMouseLeave={() => setHoveredBuilding?.(null)}
                                                onClick={() => onSelectBuilding?.(b.id)}
                                            />

                                            <g transform={`translate(${b.lengthM}, ${b.depthM})`} style={{ pointerEvents: "none" }}>
                                                <foreignObject
                                                    x={-120}
                                                    y={-14}
                                                    width={240}
                                                    height={30}
                                                >
                                                    <div style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        width: "100%",
                                                        height: "100%",
                                                        gap: "6px"
                                                    }}>
                                                        <div style={{ display: "flex", transform: "scale(0.85)", marginRight: "-20px" }}>
                                                            <BuildingIcon iconPath={b.icon_path} hovered={isHovered} />
                                                        </div>

                                                        <span style={{
                                                            color: isHovered ? "#fff" : "#2F80ED",
                                                            fontWeight: "bold",
                                                            fontSize: "13px",
                                                            fontFamily: "Roboto, sans-serif",
                                                            whiteSpace: "nowrap",
                                                            textShadow: "0px 1px 3px rgba(0,0,0,0.8)",
                                                            transition: "color 0.15s"
                                                        }}>
                                                            {b.name}
                                                        </span>
                                                    </div>
                                                </foreignObject>
                                            </g>
                                        </g>
                                    );
                                })}
                                {!isGlobalMap && children}
                            </g>
                        </svg>
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </Box>
    );
}