import { useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, TextField, IconButton, Typography, CircularProgress
} from '@mui/material';
import { DeleteOutlined } from "@mui/icons-material";

const inputStyle = {
    transition: 'all 0.2s ease-in-out',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff !important' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2F80ED !important' }
};

interface FloorDraft {
    id?: number;
    floorNumber: number;
    file: File | null;
    existingImagePath?: string;
    markedForDeletion?: boolean;
}

interface AddBuildingFloorsModalProps {
    open: boolean;
    onClose: () => void;
    floors: FloorDraft[];
    onFloorsChange: (floors: FloorDraft[]) => void;
    onRemoveFloor: (index: number) => void;
    onUndoRemoveFloor: (index: number) => void;
    onBack: () => void;
    onSave: () => void;
    isSaving: boolean;
    isLoadingFloors?: boolean;
}

export default function AddBuildingFloorsModal({
                                                   open,
                                                   onClose,
                                                   floors,
                                                   onFloorsChange,
                                                   onRemoveFloor,
                                                   onBack, onSave,
                                                   isSaving,
                                                   isLoadingFloors,
                                                   onUndoRemoveFloor
                                               }: AddBuildingFloorsModalProps) {

    const duplicateIndexes = useMemo(() => {
        const activeFloors = floors.filter(f => !f.markedForDeletion);
        const counts = new Map<number, number>();
        activeFloors.forEach(f => counts.set(f.floorNumber, (counts.get(f.floorNumber) || 0) + 1));

        const duplicates = new Set<number>();
        floors.forEach((f, i) => {
            if (!f.markedForDeletion && (counts.get(f.floorNumber) || 0) > 1) {
                duplicates.add(i);
            }
        });
        return duplicates;
    }, [floors]);

    const hasDuplicates = duplicateIndexes.size > 0;

    const addFloorRow = () => {
        const usedNumbers = new Set(floors.map(f => f.floorNumber));
        let nextNumber = floors.length + 1;
        while (usedNumbers.has(nextNumber)) {
            nextNumber += 1;
        }
        onFloorsChange([...floors, { floorNumber: nextNumber, file: null }]);
    };

    const updateFloorNumber = (index: number, value: number) => {
        const updated = [...floors];
        updated[index] = { ...updated[index], floorNumber: value };
        onFloorsChange(updated);
    };

    const updateFloorFile = (index: number, file: File) => {
        const updated = [...floors];
        updated[index] = { ...updated[index], file };
        onFloorsChange(updated);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        bgcolor: '#14161A',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
                        minWidth: 340,
                        p: 1
                    }
                }
            }}
        >
            <DialogTitle sx={{ fontSize: '18px', fontWeight: 600, pb: 1 }}>
                Загрузка планировок
            </DialogTitle>

            <DialogContent>
                {isLoadingFloors && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={24} sx={{ color: '#2F80ED' }} />
                    </Box>
                )}

                {!isLoadingFloors && floors.map((f, i) => {
                    const isDuplicate = duplicateIndexes.has(i);
                    const isExisting = f.id !== undefined;

                    if (f.markedForDeletion) {
                        return (
                            <Box
                                key={i}
                                sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    gap: 1, mb: 2, p: 1.5,
                                    bgcolor: 'rgba(244, 67, 54, 0.06)',
                                    border: '1px dashed rgba(244, 67, 54, 0.3)',
                                    borderRadius: '8px',
                                }}
                            >
                                <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                                    Этаж {f.floorNumber} — будет удалён при сохранении
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={() => onUndoRemoveFloor(i)}
                                    sx={{ color: '#2F80ED', textTransform: 'none' }}
                                >
                                    Отменить
                                </Button>
                            </Box>
                        );
                    }

                    return (
                        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                            <TextField
                                label="Этаж"
                                size="small"
                                type="number"
                                value={f.floorNumber}
                                onChange={(e) => updateFloorNumber(i, Number(e.target.value))}
                                error={isDuplicate}
                                helperText={isDuplicate ? "Этаж уже добавлен" : ""}
                                sx={{ mt: 1, flexGrow: 1 }}
                                slotProps={{
                                    input: {
                                        sx: {
                                            ...inputStyle,
                                            color: '#fff',
                                            bgcolor: isDuplicate ? 'rgba(244, 67, 54, 0.08)' : 'rgba(255,255,255,0.03)',
                                            '& .MuiOutlinedInput-notchedOutline': isDuplicate
                                                ? { borderColor: '#f44336 !important' }
                                                : undefined,
                                        }
                                    },
                                    inputLabel: { sx: { color: isDuplicate ? '#f44336' : 'rgba(255,255,255,0.5)' } }
                                }}
                            />
                            <Button
                                component="label"
                                variant="outlined"
                                sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', textTransform: 'none', mt: 1 }}
                            >
                                {f.file ? f.file.name : isExisting ? "Заменить файл" : "Выбрать файл"}
                                <input type="file" hidden onChange={(e) => {
                                    if (e.target.files?.[0]) updateFloorFile(i, e.target.files[0]);
                                }} />
                            </Button>

                            <IconButton
                                onClick={() => onRemoveFloor(i)}
                                sx={{ color: 'rgba(255,255,255,0.5)', mt: 1, '&:hover': { color: '#f44336' } }}
                            >
                                <DeleteOutlined />
                            </IconButton>
                        </Box>
                    );
                })}

                {!isLoadingFloors && (
                    <Button onClick={addFloorRow} sx={{ color: '#2F80ED', mt: 1, textTransform: 'none' }}>
                        + Добавить этаж
                    </Button>
                )}

                {hasDuplicates && (
                    <Typography sx={{ mt: 1.5, fontSize: '13px', color: '#f44336' }}>
                        Номера этажей не должны повторяться — исправьте выделенные поля
                    </Typography>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onBack} disabled={isSaving} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    Назад
                </Button>
                <Button
                    onClick={onSave}
                    disabled={isSaving || hasDuplicates}
                    variant="contained"
                    sx={{
                        bgcolor: '#2F80ED',
                        color: '#fff',
                        '&.Mui-disabled': {
                            bgcolor: 'rgba(47,128,237,0.15)',
                            color: 'rgba(255,255,255,0.4)'
                        }
                    }}
                >
                    {isSaving ? "Сохранение..." : "Сохранить"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}