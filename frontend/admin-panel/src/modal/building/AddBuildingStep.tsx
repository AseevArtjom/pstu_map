import { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../store/store.ts';
import { createBuilding, updateBuilding } from '../../store/buildingSlice.ts';
import { uploadFloorPlan } from '../../store/floorPlanSlice.ts';
import SaveBuildingModal from './SaveBuildingModal.tsx';
import AddBuildingFloorsModal from './AddBuildingFloorsModal.tsx';

interface AddBuildingStepProps {
    open: boolean;
    onClose: () => void;
    points: { x: number, y: number }[];
    initialData?: {
        id: number;
        name: string;
        hexColor: string;
        icon: string | null;
    } | null;
}

interface FloorDraft {
    floorNumber: number;
    file: File | null;
}

interface BuildingDraft {
    name: string;
    hexColor: string;
    icon: string | null;
}

const calculateCenter = (points: {x: number, y: number}[]) => {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const centerX = xs.reduce((a, b) => a + b, 0) / xs.length;
    const centerY = ys.reduce((a, b) => a + b, 0) / ys.length;
    return { centerX: Math.round(centerX), centerY: Math.round(centerY) };
};

export default function AddBuildingStep({ open, onClose, points, initialData }: AddBuildingStepProps) {
    const dispatch = useAppDispatch();
    const [step, setStep] = useState<'info' | 'floors'>('info');

    const [buildingDraft, setBuildingDraft] = useState<BuildingDraft | null>(null);
    const [floorsDraft, setFloorsDraft] = useState<FloorDraft[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const wasOpen = useRef(false);

    useEffect(() => {
        if (open && !wasOpen.current) {
            setStep('info');
            setFloorsDraft([]);
            setBuildingDraft(
                initialData
                    ? { name: initialData.name, hexColor: initialData.hexColor, icon: initialData.icon }
                    : null
            );
        }
        wasOpen.current = open;
    }, [open, initialData]);

    const handleInfoNext = (name: string, hex: string, icon: string | null) => {
        setBuildingDraft({ name, hexColor: hex, icon });
        setStep('floors');
    };

    const handleFinalSave = async () => {
        if (!buildingDraft) return;
        setIsSaving(true);

        try {
            const { centerX, centerY } = calculateCenter(points);
            const mapPolygon = points.map(p => `${p.x},${p.y}`).join(' ');

            let resolvedBuildingId: number;

            if (initialData) {
                await dispatch(updateBuilding({
                    id: initialData.id,
                    name: buildingDraft.name,
                    hex_color: buildingDraft.hexColor,
                    icon_path: buildingDraft.icon,
                    lengthM: centerX,
                    depthM: centerY,
                    mapPolygon
                })).unwrap();
                resolvedBuildingId = initialData.id;
            } else {
                const result = await dispatch(createBuilding({
                    name: buildingDraft.name,
                    hex_color: buildingDraft.hexColor,
                    icon_path: buildingDraft.icon,
                    lengthM: centerX,
                    depthM: centerY,
                    mapPolygon
                })).unwrap();
                resolvedBuildingId = result.id;
            }

            for (const f of floorsDraft) {
                if (f.file) {
                    await dispatch(uploadFloorPlan({
                        buildingId: resolvedBuildingId,
                        floorNumber: f.floorNumber,
                        file: f.file
                    })).unwrap();
                }
            }

            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            {step === 'info' && (
                <SaveBuildingModal
                    open={open}
                    onClose={onClose}
                    onNext={handleInfoNext}
                    initialData={
                        buildingDraft
                            ? { name: buildingDraft.name, hexColor: buildingDraft.hexColor, icon: buildingDraft.icon }
                            : initialData
                    }
                />
            )}

            {step === 'floors' && (
                <AddBuildingFloorsModal
                    open={open}
                    onClose={onClose}
                    floors={floorsDraft}
                    onFloorsChange={setFloorsDraft}
                    onBack={() => setStep('info')}
                    onSave={handleFinalSave}
                    isSaving={isSaving}
                />
            )}
        </>
    );
}