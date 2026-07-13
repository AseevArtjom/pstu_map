import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface ContextMenuProps {
    mouseX: number | null;
    mouseY: number | null;
    targetType: 'map' | 'item' | null;
    targetId?: number;
    onClose: () => void;
    onAddBuilding: () => void;
    onEditBuilding: (id: number) => void;
    onDeleteBuilding: (id: number) => void;
}

export default function BuildingContextMenu({
                                        mouseX,
                                        mouseY,
                                        targetType,
                                        targetId,
                                        onClose,
                                        onAddBuilding,
                                        onEditBuilding,
                                        onDeleteBuilding,
                                    }: ContextMenuProps) {
    const isOpen = mouseX !== null && mouseY !== null;

    const menuItemStyle = {
        outline: 'none !important',
        '&:focus': { outline: 'none !important', bgcolor: 'transparent' },
        '&:focus-visible': { outline: 'none !important' },
        transition: 'background-color 0.15s ease'
    };

    return (
        <Menu
            open={isOpen}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={
                mouseX !== null && mouseY !== null ? { top: mouseY, left: mouseX } : undefined
            }
            slotProps={{
                paper: {
                    sx: {
                        bgcolor: '#14161A',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
                        minWidth: 180,
                        overflow: 'hidden',
                    }
                },
            }}
        >
            {targetType === 'map' && (
                <MenuItem
                    onClick={() => {
                        onAddBuilding();
                        onClose();
                    }}
                    sx={{
                        ...menuItemStyle,
                        '&:hover': { bgcolor: 'rgba(47, 128, 237, 0.15)' },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: '36px !important' }}>
                        <AddBusinessIcon fontSize="small" sx={{ color: '#2F80ED' }} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Добавить корпус"
                        slotProps={{
                            primary: {
                                sx: { fontSize: '14px', fontWeight: 500 }
                            }
                        }}
                    />
                </MenuItem>
            )}

            {targetType === 'item' && targetId && [
                <MenuItem
                    key="edit"
                    onClick={() => {
                        onEditBuilding(targetId);
                        onClose();
                    }}
                    sx={{
                        ...menuItemStyle,
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: '36px !important' }}>
                        <EditIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Изменить"
                        slotProps={{
                            primary: {
                                sx: { fontSize: '14px', fontWeight: 500 }
                            }
                        }}

                    />
                </MenuItem>,
                <MenuItem
                    key="delete"
                    onClick={() => {
                        onDeleteBuilding(targetId);
                        onClose();
                    }}
                    sx={{
                        ...menuItemStyle,
                        color: '#ff4d4f',
                        '&:hover': { bgcolor: 'rgba(255, 77, 79, 0.15)' },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: '36px !important' }}>
                        <DeleteIcon fontSize="small" sx={{ color: '#ff4d4f' }} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Удалить"
                        slotProps={{
                            primary: {
                                sx: { fontSize: '14px', fontWeight: 500 }
                            }
                        }}
                    />
                </MenuItem>,
            ]}
        </Menu>
    );
}