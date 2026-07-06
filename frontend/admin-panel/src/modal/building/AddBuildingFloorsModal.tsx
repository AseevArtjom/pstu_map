import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, TextField, IconButton
} from '@mui/material';
import { useAppDispatch } from "../../store/store.ts";
import { uploadFloorPlan } from "../../store/floorPlanSlice.ts";
import {DeleteOutlined} from "@mui/icons-material";

const inputStyle = {
    transition: 'all 0.2s ease-in-out',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff !important' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2F80ED !important' }
};

interface AddBuildingFloorsModalProps {
    open: boolean;
    onClose: () => void;
    buildingId: number;
    onBack: () => void;
    onFinish: () => void;
}

export default function AddBuildingFloorsModal({
                                                   open, onClose, buildingId, onBack, onFinish
                                               }: AddBuildingFloorsModalProps) {
    const dispatch = useAppDispatch();
    const [floors, setFloors] = useState<{floorNumber: number, file: File | null}[]>([]);

    const addFloorRow = () => {
        setFloors([...floors, { floorNumber: floors.length + 1, file: null }]);
    };

    const removeFloorRow = (index: number) => {
        setFloors(floors.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        for (const f of floors) {
            if (f.file) {
                await dispatch(uploadFloorPlan({
                    buildingId,
                    floorNumber: f.floorNumber,
                    file: f.file
                })).unwrap();
            }
        }
        onFinish();
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
                {floors.map((f, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                        <TextField
                            label="Этаж"
                            size="small"
                            type="number"
                            value={f.floorNumber}
                            onChange={(e) => {
                                const newFloors = [...floors];
                                newFloors[i].floorNumber = Number(e.target.value);
                                setFloors(newFloors);
                            }}
                            sx={{ mt: 1, flexGrow: 1 }}
                            slotProps={{
                                input: { sx: { ...inputStyle, color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' } },
                                inputLabel: { sx: { color: 'rgba(255,255,255,0.5)' } }
                            }}
                        />
                        <Button
                            component="label"
                            variant="outlined"
                            sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', textTransform: 'none', mt: 1 }}
                        >
                            {f.file ? f.file.name : "Выбрать файл"}
                            <input type="file" hidden onChange={(e) => {
                                const newFloors = [...floors];
                                newFloors[i].file = e.target.files![0];
                                setFloors(newFloors);
                            }} />
                        </Button>

                        <IconButton
                            onClick={() => removeFloorRow(i)}
                            sx={{ color: 'rgba(255,255,255,0.5)', mt: 1, '&:hover': { color: '#f44336' } }}
                        >
                            <DeleteOutlined />
                        </IconButton>
                    </Box>
                ))}

                <Button
                    onClick={addFloorRow}
                    sx={{ color: '#2F80ED', mt: 1, textTransform: 'none' }}
                >
                    + Добавить этаж
                </Button>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onBack} sx={{ color: 'rgba(255,255,255,0.5)' }}>Назад</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    sx={{ bgcolor: '#2F80ED', color: '#fff' }}
                >
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
}