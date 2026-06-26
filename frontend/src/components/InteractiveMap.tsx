import { Box } from "@mui/material";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { ReactNode } from "react";
import { useRef, useEffect, useState } from "react";

interface InteractiveMapProps {
    bgImage: string;
    width?: number;
    height?: number;
    children: ReactNode;
}

export default function InteractiveMap({
                                           bgImage,
                                           width = 805,
                                           height = 780,
                                           children,
                                       }: InteractiveMapProps) {
    const PADDING = 120;
    const totalWidth = width + PADDING * 2;
    const totalHeight = height + PADDING * 2;

    const INITIAL_SCALE = 1.2;

    const containerRef = useRef<HTMLDivElement>(null);
    const [initialPos, setInitialPos] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            const x = (clientWidth - totalWidth * INITIAL_SCALE) / 2;
            const y = (clientHeight - totalHeight * INITIAL_SCALE) / 2;

            setInitialPos({ x, y });
        }
    }, [totalWidth, totalHeight]);
    if (!initialPos) {
        return (
            <Box
                ref={containerRef}
                sx={{
                    width: "100%",
                    height: "100%",
                    bgcolor: "#14161A",
                    background: `
                      conic-gradient(
                        rgb(20, 20, 35) 0.25turn, 
                        rgb(14, 14, 26) 0.25turn 0.5turn, 
                        rgb(20, 20, 35) 0.5turn 0.75turn, 
                        rgb(14, 14, 26) 0.75turn
                      ) 0px 0px / 40px 40px
                    `
                }}
            />
        );
    }

    return (
        <Box
            ref={containerRef}
            sx={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: `
                  conic-gradient(
                    rgb(20, 20, 35) 0.25turn, 
                    rgb(14, 14, 26) 0.25turn 0.5turn, 
                    rgb(20, 20, 35) 0.5turn 0.75turn, 
                    rgb(14, 14, 26) 0.75turn
                  ) 0px 0px / 40px 40px
                `,
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

                panning={{
                    velocityDisabled: true
                }}
                smooth={true}
                wheel={{
                    disabled: false,
                    step: 0.002,
                }}
                zoomAnimation={{
                    disabled: false,
                    animationTime: 220,
                    animationType: "easeOutQuad"
                }}
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
                                width={width}
                                height={height}
                                style={{ pointerEvents: "none" }}
                            />

                            <g transform={`translate(${PADDING}, ${PADDING})`}>
                                {children}
                            </g>
                        </svg>
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </Box>
    );
}