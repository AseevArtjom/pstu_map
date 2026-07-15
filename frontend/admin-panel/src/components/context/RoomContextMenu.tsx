import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface RoomContextMenuProps {
    mouseX: number | null;
    mouseY: number | null;
    targetType: 'floor_map' | 'room' | null;
    targetId?: string;
    onClose: () => void;
    onAddRoom: () => void;
    onEditRoom: (id: string) => void;
    onDeleteRoom: (id: string) => void;
}

export default function RoomContextMenu({
                                            mouseX, mouseY, targetType, targetId,
                                            onClose, onAddRoom, onEditRoom, onDeleteRoom
                                        }: RoomContextMenuProps) {
    const isOpen = mouseX !== null && mouseY !== null;

    return (
        <Menu
            open={isOpen}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={isOpen ? { top: mouseY!, left: mouseX! } : undefined}
            slotProps={{
                paper: { sx: { bgcolor: '#14161A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', minWidth: 180 } }
            }}
        >
            {targetType === 'floor_map' && (
                <MenuItem onClick={() => { onAddRoom(); onClose(); }}>
                    <ListItemIcon><MeetingRoomIcon fontSize="small" sx={{ color: '#2F80ED' }} /></ListItemIcon>
                    <ListItemText primary="Добавить комнату" />
                </MenuItem>
            )}

            {targetType === 'room' && targetId && (
                <>
                    <MenuItem onClick={() => { onEditRoom(targetId); onClose(); }}>
                        <ListItemIcon><EditIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} /></ListItemIcon>
                        <ListItemText primary="Изменить" />
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            onClose();
                            onDeleteRoom(targetId);
                        }}
                        sx={{ color: '#ff4d4f' }}
                    >
                        <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: '#ff4d4f' }} /></ListItemIcon>
                        <ListItemText primary="Удалить" />
                    </MenuItem>
                </>
            )}
        </Menu>
    );
}