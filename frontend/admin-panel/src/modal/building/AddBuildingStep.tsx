import { useState, useEffect, useRef } from 'react';
import { useConfirm } from "material-ui-confirm";
import { useAppDispatch } from '../../store/store.ts';
import { createBuilding, updateBuilding } from '../../store/buildingSlice.ts';
import {uploadFloorPlan, fetchFloorsByBuilding, deleteFloorPlan} from '../../store/floorPlanSlice.ts';
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

export interface FloorDraft {
    id?: number;
    floorNumber: number;
    file: File | null;
    existingImagePath?: string;
    markedForDeletion?: boolean;
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
    const confirm = useConfirm();

    const [step, setStep] = useState<'info' | 'floors'>('info');
    const [buildingDraft, setBuildingDraft] = useState<BuildingDraft | null>(null);
    const [floorsDraft, setFloorsDraft] = useState<FloorDraft[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingFloors, setIsLoadingFloors] = useState(false);

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

    const handleInfoNext = async (name: string, hex: string, icon: string | null) => {
        setBuildingDraft({ name, hexColor: hex, icon });

        if (initialData) {
            setIsLoadingFloors(true);
            try {
                const existingFloors = await dispatch(fetchFloorsByBuilding(initialData.id)).unwrap();
                setFloorsDraft(existingFloors.map(f => ({
                    id: f.id,
                    floorNumber: f.floorNumber,
                    file: null,
                    existingImagePath: f.imagePath,
                })));
            } finally {
                setIsLoadingFloors(false);
            }
        }

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
                if (f.markedForDeletion && f.id !== undefined) {
                    await dispatch(deleteFloorPlan({ buildingId: resolvedBuildingId, floorId: f.id })).unwrap();
                }
            }

            for (const f of floorsDraft) {
                if (!f.markedForDeletion && f.file) {
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

    const handleRemoveFloor = async (index: number) => {
        const floor = floorsDraft[index];

        if (floor.id !== undefined && initialData) {
            const { confirmed } = await confirm({
                title: 'Удалить этаж?',
                description: `Этаж ${floor.floorNumber} будет удалён вместе со всеми его комнатами, узлами навигации и связями при сохранении формы.`,
                confirmationText: 'Удалить',
                cancellationText: 'Отмена',
            });

            if (!confirmed) return;

            setFloorsDraft(floorsDraft.map((f, i) =>
                i === index ? { ...f, markedForDeletion: true } : f
            ));
            return;
        }
        setFloorsDraft(floorsDraft.filter((_, i) => i !== index));
    };

    const handleUndoRemoveFloor = (index: number) => {
        setFloorsDraft(floorsDraft.map((f, i) =>
            i === index ? { ...f, markedForDeletion: false } : f
        ));
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
                    onRemoveFloor={handleRemoveFloor}
                    onUndoRemoveFloor={handleUndoRemoveFloor}
                    onBack={() => setStep('info')}
                    onSave={handleFinalSave}
                    isSaving={isSaving}
                    isLoadingFloors={isLoadingFloors}
                />
            )}
        </>
    );
}