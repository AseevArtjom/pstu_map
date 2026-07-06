import { useState } from 'react';
import { useAppDispatch } from '../../store/store.ts';
import {createBuilding, updateBuilding} from '../../store/buildingSlice.ts';
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

const calculateCenter = (points: {x: number, y: number}[]) => {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const centerX = xs.reduce((a, b) => a + b, 0) / xs.length;
    const centerY = ys.reduce((a, b) => a + b, 0) / ys.length;
    return { centerX: Math.round(centerX), centerY: Math.round(centerY) };
};

export default function AddBuildingStep({ open, onClose, points,initialData }: AddBuildingStepProps) {
    const dispatch = useAppDispatch();
    const [step, setStep] = useState<'info' | 'floors'>('info');
    const [buildingId, setBuildingId] = useState<number | null>(initialData?.id || null);

    const handleSaveInfo = async (name: string, hex: string, icon: string | null) => {
        const { centerX, centerY } = calculateCenter(points);
        const mapPolygon = points.map(p => `${p.x},${p.y}`).join(' ');

        if (initialData) {
            await dispatch(updateBuilding({
                id: initialData.id,
                name,
                hex_color: hex,
                icon_path: icon,
                lengthM: centerX,
                depthM: centerY,
                mapPolygon
            })).unwrap();
            setStep('floors');
        } else {
            const result = await dispatch(createBuilding({
                name,
                hex_color: hex,
                icon_path: icon,
                lengthM: centerX,
                depthM: centerY,
                mapPolygon
            })).unwrap();

            if (result?.id) {
                setBuildingId(result.id);
                setStep('floors');
            }
        }
    };


    return (
        <>
            {step === 'info' && (
                <SaveBuildingModal
                    open={open}
                    onClose={onClose}
                    onNext={handleSaveInfo}
                    initialData={initialData}
                />
            )}

            {step === 'floors' && buildingId && (
                <AddBuildingFloorsModal
                    open={open}
                    onClose={onClose}
                    buildingId={buildingId}
                    onBack={() => setStep('info')}
                    onFinish={onClose}
                />
            )}
        </>
    );
}