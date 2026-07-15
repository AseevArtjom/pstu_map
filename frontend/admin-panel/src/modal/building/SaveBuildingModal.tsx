import { useState, useRef, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    Box, Typography, Select, MenuItem, type SelectChangeEvent
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useAppDispatch, useAppSelector } from "../../store/store.ts";
import {deleteIcon, fetchIcons, uploadIcon} from "../../store/iconSlice.ts";
import { BASE_URL } from "../../http.ts";
import IconItemContent from "../../components/IconItemContent.tsx";
import {useConfirm} from "material-ui-confirm";

interface SaveBuildingModalProps {
    open: boolean;
    onClose: () => void;
    onNext: (name: string, hexColor: string, icon: string | null) => void;
    initialData?: any;
}

const inputStyle = {
    transition: 'all 0.2s ease-in-out',
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255,255,255,0.1)'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#fff !important'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#2F80ED !important'
    }
};

export default function SaveBuildingModal({ open, onClose, onNext,initialData }: SaveBuildingModalProps) {
    const dispatch = useAppDispatch();
    const confirm = useConfirm();

    const { icons = [] } = useAppSelector((state) => state.icon || { icons: [] });

    const [name, setName] = useState('');
    const [hexColor, setHexColor] = useState('#2F80ED');
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (open) {
            dispatch(fetchIcons()).unwrap().then((data) => {
                if (initialData?.icon) {
                    setSelectedIcon(initialData.icon);
                } else if (data && data.length > 0 && !selectedIcon) {
                    setSelectedIcon(data[0].filePath);
                }
            });

            if (initialData) {
                setName(initialData.name || '');
                setHexColor(initialData.hexColor || '#2F80ED');
            } else {
                setName('');
                setHexColor('#2F80ED');
            }
        }
    }, [open, initialData, dispatch]);

    const handleSave = () => {
        const isNameInvalid = !name.trim();

        if (isNameInvalid) {
            setError(true);
            return;
        }
        setError(false);
        const finalIcon = selectedIcon || (icons.length > 0 ? icons[0].filePath : null);
        if (!finalIcon) {
            alert("Выберите иконку!");
            return;
        }

        onNext(name.trim(), hexColor.toUpperCase(), finalIcon);
    };

    const handleIconDelete = async (iconIdToDelete: number, event: React.MouseEvent) => {
        event.preventDefault();

        const { confirmed } = await confirm({
            title: 'Удалить иконку?',
            description: 'Иконка будет удалена безвозвратно.',
            confirmationText: 'Удалить',
            cancellationText: 'Отмена',
        });

        if (!confirmed) return;

        await dispatch(deleteIcon(iconIdToDelete)).unwrap();
    };

    const handleColorChangeWithDelay = (newColor: string) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setHexColor(newColor.toUpperCase());
        }, 150);
    };

    const handleIconSelect = (event: SelectChangeEvent) => {
        if (event.target.value === 'upload') {
            fileInputRef.current?.click();
        } else {
            setSelectedIcon(event.target.value);
        }
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
                {initialData ? "Редактирование корпуса" : "Сохранение нового корпуса"}
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mt: 1 }}>
                    <Select
                        value={selectedIcon || ''}
                        onChange={handleIconSelect}
                        IconComponent={() => null}
                        renderValue={(selected) => {
                            if (!selected) return null;

                            return (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%'
                                }}>
                                    <img
                                        src={`${BASE_URL}${selected}`}
                                        style={{
                                            marginRight: "-18px",
                                            filter: 'invert(1) brightness(100%)',
                                            display: 'block'
                                        }}
                                        alt="icon"
                                    />
                                </Box>
                            );
                        }}
                        MenuProps={{
                            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                            transformOrigin: { vertical: 'top', horizontal: 'left' },
                            slotProps: {
                                paper: {
                                    sx: {
                                        bgcolor: '#15161A',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        width: 225,
                                        padding: 1,
                                        mt: 1
                                    }
                                },
                                list: {
                                    sx: {
                                        display: 'flex',
                                        flexDirection: 'row',
                                        flexWrap: 'wrap',
                                        padding: 0
                                    }
                                }
                            }
                        }}
                        sx={{ ...inputStyle, width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.03)', color: '#fff' }}
                    >
                        {Array.isArray(icons) && icons.map((icon) => (
                            <MenuItem
                                key={icon.id}
                                value={icon.filePath}
                                onContextMenu={(e) => {
                                    handleIconDelete(icon.id,e);
                                }}
                                sx={{
                                    width: 48, height: 48, justifyContent: 'center', m: 0.5,
                                    borderRadius: '8px', bgcolor: selectedIcon === icon.filePath ? 'rgba(47, 128, 237, 0.2)' : 'transparent',
                                }}
                            >
                                <IconItemContent filePath={icon.filePath} />
                            </MenuItem>
                        ))}
                        <MenuItem
                            value="upload"
                            sx={{ width: '100%', border: '1px solid #333', mt: 1, justifyContent: 'center', color: '#fff' }}
                        >
                            <AddPhotoAlternateIcon />
                        </MenuItem>
                    </Select>

                    <TextField
                        autoFocus
                        label="Название корпуса"
                        fullWidth
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError(false);
                        }}
                        error={error}
                        helperText={error ? "Введите название корпуса" : ""}
                        slotProps={{
                            input: { sx: { ...inputStyle, color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' } },
                            inputLabel: { sx: { color: error ? '#f44336' : 'rgba(255,255,255,0.5)' } }
                        }}
                    />
                </Box>

                <Typography
                    sx={{
                        fontSize: '14px', color: 'rgba(255,255,255,0.6)', mt: 3, mb: 1.5,
                        transition: 'color 0.2s',
                        '&:hover': { color: '#fff' }
                    }}
                >
                    Выберите цвет заливки:
                </Typography>

                <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center', mb: 3 }}>
                    <Box sx={{
                        position: 'relative', width: 44, height: 44, borderRadius: '8px', overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'border-color 0.2s',
                        '&:hover': { border: '1px solid #fff' }
                    }}>
                        <input
                            type="color"
                            value={hexColor}
                            onChange={(e) => handleColorChangeWithDelay(e.target.value)}
                            style={{
                                position: 'absolute', top: '-8px', left: '-8px',
                                width: '60px', height: '60px', border: 'none', background: 'none', cursor: 'pointer'
                            }}
                        />
                    </Box>

                    <TextField
                        variant="outlined"
                        size="small"
                        value={hexColor}
                        onChange={(e) => {
                            let val = e.target.value;
                            if (!val.startsWith('#')) val = '#' + val;
                            if (val.length <= 7) setHexColor(val.toUpperCase());
                        }}
                        slotProps={{
                            input: { sx: { ...inputStyle, color: '#fff', fontFamily: 'monospace', fontSize: '14px', textTransform: 'uppercase' } }
                        }}
                        sx={{ flexGrow: 1 }}
                    />
                </Box>

                <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={async (e) => {
                        if (e.target.files?.[0]) {
                            const uploaded = await dispatch(uploadIcon(e.target.files[0])).unwrap();
                            setSelectedIcon(uploaded.filePath);
                        }
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}>Отмена</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    sx={{ bgcolor: '#2F80ED', color: '#fff' }}
                >
                    Далее
                </Button>
            </DialogActions>
        </Dialog>
    );
}