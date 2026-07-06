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
    hoveredBuilding?: number | null;
    setHoveredBuilding?: (id: number | null) => void;
    onSelectBuilding?: (id: number) => void;
    isDrawingMode?: boolean;
    editingId?: number | null;
}

export default function InteractiveMap({
    bgImage,
    children,
    onDimensionsLoad,
    isGlobalMap = false,
    hoveredBuilding = null,
    setHoveredBuilding,
    onSelectBuilding,
    isDrawingMode,
    editingId
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
    }, [bgImage]);

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
                doubleClick={{ disabled: true}}
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
                                    if (b.id === editingId || !b.mapPolygon) return null;
                                    const isHovered = !isDrawingMode && hoveredBuilding === b.id;

                                    return (
                                        <polygon
                                            key={`poly-${b.id}`}
                                            points={b.mapPolygon}
                                            fill={isHovered ? `${b.hex_color}4D` : `${b.hex_color}20`}
                                            stroke={b.hex_color}
                                            strokeWidth={isHovered ? 2.5 : 1.5}
                                            style={{ cursor: "pointer", pointerEvents: isDrawingMode ? "none" : "auto" }}
                                            onMouseEnter={() => setHoveredBuilding?.(b.id)}
                                            onMouseLeave={() => setHoveredBuilding?.(null)}
                                            onClick={() => onSelectBuilding?.(b.id)}
                                        />
                                    );
                                })}

                                {children}

                                {isGlobalMap && buildings.map((b) => {
                                    if (b.id === editingId) return null;
                                    const isHovered = !isDrawingMode && hoveredBuilding === b.id;

                                    return (
                                        <g
                                            key={`label-${b.id}`}
                                            transform={`translate(${b.lengthM}, ${b.depthM})`}
                                            style={{ pointerEvents: "none", opacity: isDrawingMode ? 0.4 : 1 }}
                                        >
                                            <foreignObject x={-120} y={-14} width={240} height={30}>
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    width: "100%",
                                                    height: "100%"
                                                }}>
                                                    <BuildingIcon iconPath={b.icon_path} iconColor={b.hex_color}/>
                                                    <span style={{
                                                        color: isHovered ? "#fff" : b.hex_color,
                                                        marginLeft: "4px",
                                                        fontWeight: "bold",
                                                        fontSize: "13px",
                                                        fontFamily: "Roboto, sans-serif",
                                                        whiteSpace: "nowrap",
                                                        textShadow: isHovered ? `
                                                            -1px -1px 0 #15161A, 
                                                             1px -1px 0 #15161A, 
                                                            -1px  1px 0 #15161A, 
                                                             1px  1px 0 #15161A,
                                                             0px 0px 8px ${b.hex_color}, 
                                                             0px 1px 3px rgba(0,0,0,0.8)
                                                            `
                                                            :
                                                            `
                                                            -1px -1px 0 #15161A, 
                                                             1px -1px 0 #15161A, 
                                                            -1px  1px 0 #15161A, 
                                                             1px  1px 0 #15161A,
                                                             0px 1px 3px rgba(0,0,0,0.8)
                                                             `,
                                                        transition: "color 0.15s, text-shadow 0.3s ease"
                                                    }}>
                                                        {b.name}
                                                    </span>
                                                </div>
                                            </foreignObject>
                                        </g>
                                    );
                                })}
                            </g>
                        </svg>
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </Box>
    );
}