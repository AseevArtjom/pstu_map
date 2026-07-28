import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button
} from "@mui/material";
import type {EdgeType} from "@shared/types/EdgeType.ts";

interface EdgeTypeDialogProps {
    open: boolean;
    value: EdgeType;
    onChange: (type: EdgeType) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export default function EdgeTypeDialog({
                                           open,
                                           value,
                                           onChange,
                                           onClose,
                                           onConfirm
                                       }: EdgeTypeDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: "#1C1E22",
                        color: "#E4E6EB",
                        border: "1px solid rgba(255, 255, 255, 0.08)"
                    }
                }
            }}
        >
            <DialogTitle sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                Тип межэтажного перехода
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
                <Typography variant="body2" sx={{ color: "#90949C", mb: 2 }}>
                    Выберите, каким образом связаны эти узлы на разных этажах:
                </Typography>
                <FormControl component="fieldset">
                    <RadioGroup
                        value={value}
                        onChange={(e) => onChange(e.target.value as EdgeType)}
                    >
                        <FormControlLabel
                            value="stairs"
                            control={<Radio sx={{ color: '#2F80ED', '&.Mui-checked': { color: '#2F80ED' } }} />}
                            label="Лестница"
                        />
                        <FormControlLabel
                            value="elevator"
                            control={<Radio sx={{ color: '#2F80ED', '&.Mui-checked': { color: '#2F80ED' } }} />}
                            label="Лифт"
                        />
                        <FormControlLabel
                            value="outdoor"
                            control={<Radio sx={{ color: '#2F80ED', '&.Mui-checked': { color: '#2F80ED' } }} />}
                            label="Вход / Выход на улицу"
                        />
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <Button onClick={onClose} sx={{ color: '#90949C' }}>
                    Отмена
                </Button>
                <Button onClick={onConfirm} variant="contained" sx={{ bgcolor: '#2F80ED' }}>
                    Подтвердить
                </Button>
            </DialogActions>
        </Dialog>
    );
}