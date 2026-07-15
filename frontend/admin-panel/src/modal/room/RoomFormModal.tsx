import { useState, useEffect, useRef } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, MenuItem, Box, Typography, Grid, Paper, Divider
} from "@mui/material";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import type { RoomType } from "@shared/types/RoomType.ts";
import IconItemContent from "../../components/IconItemContent.tsx";
import { useAppDispatch } from "../../store/store.ts";
import {deleteIcon, uploadIcon} from "../../store/iconSlice.ts";
import { createRoomType } from "../../store/roomTypeSlice.ts";
import {AddCircleOutlined} from "@mui/icons-material";
import {useConfirm} from "material-ui-confirm";

interface UploadedIconDto {
    id: number;
    filePath: string;
}

interface RoomFormInitialData {
    name: string;
    roomTypeId: number | "";
    customColor?: string | null;
    customIconId?: number | null;
    description?: string | null;
    nodeId?: string | null;
}

interface RoomFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    onSelectNodeReq: (currentDraft: RoomFormInitialData) => void;
    polygonPoints: string;
    floor: number;
    roomTypes: RoomType[];
    availableIcons: UploadedIconDto[];
    initialData?: RoomFormInitialData | null;
}

const inputStyle = {
    transition: 'all 0.2s ease-in-out',
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255,255,255,0.1)'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255,255,255,0.2)'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#2F80ED !important'
    }
};

const NEW_TYPE_VALUE = "__new_type__";

export default function RoomFormModal({
                                          isOpen, onClose, onSave,onSelectNodeReq, polygonPoints, floor, roomTypes, availableIcons, initialData
                                      }: RoomFormModalProps) {
    const dispatch = useAppDispatch();
    const confirm = useConfirm();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [roomTypeId, setRoomTypeId] = useState<number | "">("");
    const [nameError, setNameError] = useState(false);

    const [nodeId, setNodeId] = useState<string | null>(null);

    const [color, setColor] = useState("#2F80ED");
    const [iconId, setIconId] = useState<number | null>(null);

    const isManualOverride = useRef(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wasOpen = useRef(false);
    const iconFileInputRef = useRef<HTMLInputElement>(null);

    const [isCreatingType, setIsCreatingType] = useState(false);
    const [newTypeName, setNewTypeName] = useState("");
    const [newTypeColor, setNewTypeColor] = useState("#2F80ED");
    const [newTypeError, setNewTypeError] = useState(false);

    const selectedType = roomTypes.find(t => t.id === roomTypeId);
    const isEditMode = Boolean(initialData);

    useEffect(() => {
        if (isOpen && !wasOpen.current) {
            if (initialData) {
                setName(initialData.name);
                setDescription(initialData.description || "");
                setRoomTypeId(initialData.roomTypeId);
                setColor(initialData.customColor || "#2F80ED");
                setIconId(initialData.customIconId ?? null);
                setNodeId(initialData.nodeId ?? null);
                isManualOverride.current = true;
            } else {
                setName("");
                setDescription("");
                setRoomTypeId("");
                setColor("#2F80ED");
                setIconId(null);
                setNodeId(null);
                isManualOverride.current = false;
            }
            setNameError(false);
            setIsCreatingType(false);
            setNewTypeName("");
            setNewTypeColor("#2F80ED");
            setNewTypeError(false);
        }
        wasOpen.current = isOpen;
    }, [isOpen, initialData]);

    useEffect(() => {
        if (!selectedType) return;
        if (isManualOverride.current) {
            isManualOverride.current = false;
            return;
        }

        setColor(selectedType.defaultColor || "#2F80ED");

        const defaultIcon = availableIcons.find(icon => icon.filePath === selectedType.defaultIconPath);
        setIconId(defaultIcon ? defaultIcon.id : null);
    }, [selectedType, availableIcons]);

    const handleColorChangeWithDelay = (newColor: string) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setColor(newColor.toUpperCase());
        }, 150);
    };

    const handleTriggerSelectNode = () => {
        onSelectNodeReq({
            name: name.trim(),
            roomTypeId,
            customColor: color,
            customIconId: iconId,
            description: description.trim(),
            nodeId: nodeId
        });
    };

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const handleTypeSelectChange = (value: string) => {
        if (value === NEW_TYPE_VALUE) {
            setIsCreatingType(true);
            return;
        }
        setRoomTypeId(Number(value));
    };

    const slugify = (text: string) =>
        text
            .toLowerCase()
            .trim()
            .replace(/[^a-zа-яё0-9]+/gi, '-')
            .replace(/^-+|-+$/g, '');

    const handleCreateType = async () => {
        if (!newTypeName.trim()) {
            setNewTypeError(true);
            return;
        }
        setNewTypeError(false);

        const result = await dispatch(createRoomType({
            slug: slugify(newTypeName) || `type-${Date.now()}`,
            name: newTypeName.trim(),
            defaultColor: newTypeColor,
        })).unwrap();

        isManualOverride.current = false;
        setRoomTypeId(result.id);
        setIsCreatingType(false);
        setNewTypeName("");
        setNewTypeColor("#2F80ED");
    };

    const handleIconUpload = async (file: File) => {
        const uploaded = await dispatch(uploadIcon(file)).unwrap();
        setIconId(uploaded.id);
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

        if (iconId === iconIdToDelete) {
            setIconId(null);
        }
    };

    const handleSave = () => {
        if (!name.trim()) {
            setNameError(true);
            return;
        }

        onSave({
            id: null,
            name: name.trim(),
            floor,
            roomTypeId,
            description: description.trim(),
            roomPolygon: polygonPoints,
            customColor: color,
            customIconId: iconId,
            nodeId: nodeId
        });
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        bgcolor: '#14161A',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
                    }
                }
            }}
        >
            <DialogTitle sx={{ fontSize: '18px', fontWeight: 600, pb: 1 }}>
                {isEditMode ? "Редактирование помещения" : "Создание нового помещения"}
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
                <TextField
                    sx={{ marginTop: "12px" }}
                    autoFocus
                    label="Название / Номер аудитории"
                    fullWidth
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError(false);
                    }}
                    error={nameError}
                    helperText={nameError ? "Введите название помещения" : ""}
                    slotProps={{
                        input: { sx: { ...inputStyle, color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' } },
                        inputLabel: { sx: { color: nameError ? '#f44336' : 'rgba(255,255,255,0.5)' } }
                    }}
                />

                <TextField
                    label="Описание (необязательно)"
                    fullWidth
                    multiline
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    slotProps={{
                        input: { sx: { ...inputStyle, color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' } },
                        inputLabel: { sx: { color: 'rgba(255,255,255,0.5)' } }
                    }}
                />

                {!isCreatingType ? (
                    <TextField
                        select
                        label="Тип помещения"
                        fullWidth
                        value={roomTypeId}
                        onChange={(e) => handleTypeSelectChange(e.target.value)}
                        sx={{
                            '& .MuiSelect-icon': {
                                color: 'rgba(255,255,255,0.5)'
                            },
                            '&:has(.Mui-focused) .MuiSelect-icon': {
                                color: '#2F80ED'
                            }
                        }}
                        slotProps={{
                            input: { sx: { ...inputStyle, color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' } },
                            inputLabel: { sx: { color: 'rgba(255,255,255,0.5)' } },
                            select: {
                                MenuProps: {
                                    slotProps: {
                                        paper: {
                                            sx: {
                                                bgcolor: '#15161A',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                            }
                                        }
                                    }
                                }
                            }
                        }}
                    >
                        {roomTypes.map((type) => (
                            <MenuItem key={type.id} value={type.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#fff' }}>
                                    <Box sx={{
                                        width: 12, height: 12, borderRadius: '4px',
                                        bgcolor: type.defaultColor, flexShrink: 0
                                    }} />
                                    {type.name}
                                </Box>
                            </MenuItem>
                        ))}

                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 0.5 }} />

                        <MenuItem value={NEW_TYPE_VALUE}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#2F80ED' }}>
                                <AddCircleOutlined fontSize="small" />
                                Новый тип помещения
                            </Box>
                        </MenuItem>
                    </TextField>
                ) : (
                    <Box sx={{
                        p: 2, border: '1px solid rgba(47,128,237,0.4)', borderRadius: '10px',
                        bgcolor: 'rgba(47,128,237,0.05)', display: 'flex', flexDirection: 'column', gap: 1.5
                    }}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                            Новый тип помещения
                        </Typography>

                        <TextField
                            label="Название типа (например: Лаборатория)"
                            fullWidth
                            size="small"
                            value={newTypeName}
                            onChange={(e) => {
                                setNewTypeName(e.target.value);
                                if (newTypeError) setNewTypeError(false);
                            }}
                            error={newTypeError}
                            helperText={newTypeError ? "Введите название типа" : ""}
                            slotProps={{
                                input: { sx: { ...inputStyle, color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' } },
                                inputLabel: { sx: { color: newTypeError ? '#f44336' : 'rgba(255,255,255,0.5)' } }
                            }}
                        />

                        <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <Box sx={{
                                position: 'relative', width: 36, height: 36, borderRadius: '8px', overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0
                            }}>
                                <input
                                    type="color"
                                    value={newTypeColor}
                                    onChange={(e) => setNewTypeColor(e.target.value.toUpperCase())}
                                    style={{
                                        position: 'absolute', top: '-6px', left: '-6px',
                                        width: '48px', height: '48px', background: 'none', cursor: 'pointer',
                                    }}
                                />
                            </Box>
                            <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                                Цвет по умолчанию для типа
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 0.5 }}>
                            <Button
                                size="small"
                                onClick={() => {
                                    setIsCreatingType(false);
                                    setNewTypeError(false);
                                }}
                                sx={{ color: 'rgba(255,255,255,0.5)' }}
                            >
                                Отмена
                            </Button>
                            <Button
                                size="small"
                                variant="contained"
                                onClick={handleCreateType}
                                sx={{ bgcolor: '#2F80ED', color: '#fff', '&:hover': { bgcolor: '#2F98ED' } }}
                            >
                                Создать тип
                            </Button>
                        </Box>
                    </Box>
                )}

                <Box sx={{ p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <Typography sx={{ mb: 1.5, fontSize: '14px', fontWeight: 600 }}>
                        Точка навигации (Узел графа)
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                        <Typography sx={{ fontSize: '13px', color: nodeId ? '#2F80ED' : 'rgba(255,255,255,0.4)' }}>
                            {nodeId ? `Узел привязан (ID: ...${nodeId.slice(-8)})` : 'Узел не выбран. Невозможно проложить путь сюда'}
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleTriggerSelectNode}
                            sx={{ borderColor: '#2F80ED', color: '#2F80ED', '&:hover': { borderColor: '#2F98ED', bgcolor: 'rgba(47,128,237,0.05)' }, flexShrink: 0 }}
                        >
                            {nodeId ? 'Изменить точку' : 'Выбрать на карте'}
                        </Button>
                    </Box>
                </Box>

                {selectedType && !isCreatingType && (
                    <>
                        <Box sx={{
                            p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                            bgcolor: 'rgba(255,255,255,0.02)'
                        }}>
                            <Typography sx={{ mb: 1.5, fontSize: '14px', fontWeight: 600 }}>
                                Цвет на карте
                            </Typography>
                            <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <Box sx={{
                                    position: 'relative', width: 44, height: 44, borderRadius: '8px', overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    transition: 'box-shadow 0.2s, border-color 0.2s',
                                    boxShadow: `0 0 0 rgba(0,0,0,0)`,
                                    '&:hover': {
                                        border: '1px solid #fff',
                                        boxShadow: `0 0 12px 2px ${color}80`
                                    }
                                }}>
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => handleColorChangeWithDelay(e.target.value)}
                                        style={{
                                            position: 'absolute', top: '-8px', left: '-8px',
                                            width: '60px', height: '60px', background: 'none', cursor: 'pointer',
                                        }}
                                    />
                                </Box>
                                <TextField
                                    variant="outlined"
                                    size="small"
                                    value={color}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (!val.startsWith('#')) val = '#' + val;
                                        if (val.length <= 7) setColor(val.toUpperCase());
                                    }}
                                    slotProps={{
                                        input: {
                                            sx: {
                                                ...inputStyle, color: '#fff', fontFamily: 'monospace',
                                                fontSize: '14px', textTransform: 'uppercase',
                                                bgcolor: 'rgba(255,255,255,0.03)'
                                            }
                                        }
                                    }}
                                    sx={{ flexGrow: 1 }}
                                />
                            </Box>
                        </Box>

                        <Box sx={{
                            p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                            bgcolor: 'rgba(255,255,255,0.02)'
                        }}>
                            <Typography sx={{ mb: 1.5, fontSize: '14px', fontWeight: 600 }}>
                                Иконка на карте
                            </Typography>
                            <Grid container spacing={1}>
                                {availableIcons.map((icon) => {
                                    const isSelected = iconId === icon.id;
                                    return (
                                        <Grid key={icon.id}>
                                            <Paper
                                                onClick={() => setIconId(icon.id)}
                                                onContextMenu={(e) => handleIconDelete(icon.id, e)}
                                                elevation={0}
                                                sx={{
                                                    width: 48, height: 48,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    borderRadius: '8px',
                                                    bgcolor: isSelected ? 'rgba(47,128,237,0.25)' : 'rgba(255,255,255,0.03)',
                                                    border: isSelected ? '1px solid rgba(47,128,237,1)' : '1px solid rgba(255,255,255,0.1)',
                                                    transition: 'all 0.15s ease',
                                                    '&:hover': { borderColor: '#2F80ED' }
                                                }}
                                            >
                                                <IconItemContent filePath={icon.filePath} />
                                            </Paper>
                                        </Grid>
                                    );
                                })}

                                <Grid>
                                    <Paper
                                        onClick={() => iconFileInputRef.current?.click()}
                                        elevation={0}
                                        sx={{
                                            width: 48, height: 48,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            borderRadius: '8px',
                                            bgcolor: 'rgba(255,255,255,0.03)',
                                            border: '1px dashed rgba(255,255,255,0.3)',
                                            transition: 'all 0.15s ease',
                                            '&:hover': { borderColor: '#2F80ED' }
                                        }}
                                    >
                                        <AddPhotoAlternateIcon sx={{ color: 'rgba(255,255,255,0.6)' }} />
                                    </Paper>
                                </Grid>
                            </Grid>

                            <input
                                type="file"
                                ref={iconFileInputRef}
                                hidden
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        handleIconUpload(e.target.files[0]);
                                    }
                                }}
                            />
                        </Box>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    Отмена
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!roomTypeId}
                    sx={{
                        bgcolor: '#2F80ED',
                        color: '#fff',
                        '&:hover': { bgcolor: '#2F98ED' },
                        '&.Mui-disabled': {
                            bgcolor: 'rgba(47,128,237,0.15)',
                            color: 'rgba(255,255,255,0.4)'
                        }
                    }}
                >
                    {isEditMode ? "Сохранить изменения" : "Сохранить комнату"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}