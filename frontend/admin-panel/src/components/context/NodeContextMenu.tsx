import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';

interface NodeContextMenuProps {
    mouseX: number;
    mouseY: number;
    onClose: () => void;
    onDelete: () => void;
    onStartCrossLocationLink: () => void;
    onDeleteCrossLocationLink?: () => void;
}

export default function NodeContextMenu({
                                            mouseX, mouseY, onClose, onDelete, onStartCrossLocationLink, onDeleteCrossLocationLink
                                        }: NodeContextMenuProps) {
    const open = mouseY !== 0 && mouseX !== 0;

    return (
        <Menu
            open={open}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={open ? { top: mouseY, left: mouseX } : undefined}
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: "#1C1E22",
                        color: "#E4E6EB",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        "& .MuiMenuItem-root:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.04)",
                        },
                    },
                },
            }}
        >
            {!onDeleteCrossLocationLink && (
                <MenuItem onClick={() => { onStartCrossLocationLink(); onClose(); }}>
                    <ListItemIcon><LinkIcon sx={{ color: '#2F80ED' }} /></ListItemIcon>
                    <ListItemText
                        primary="Связать с другим узлом..."
                        secondary="Другой этаж, корпус или улица"
                        slotProps={{
                            secondary: { style: { color: 'rgba(255,255,255,0.4)', fontSize: '11px' } }
                        }}
                    />
                </MenuItem>
            )}

            {onDeleteCrossLocationLink && (
                <MenuItem onClick={() => { onDeleteCrossLocationLink(); onClose(); }} sx={{ color: '#F44336' }}>
                    <ListItemIcon><LinkOffIcon sx={{ color: '#F44336' }} /></ListItemIcon>
                    <ListItemText primary="Удалить межлокационную связь" />
                </MenuItem>
            )}

            <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

            <MenuItem onClick={() => { onDelete(); onClose(); }} sx={{ color: '#F44336' }}>
                <ListItemIcon><DeleteIcon sx={{ color: '#F44336' }} /></ListItemIcon>
                <ListItemText primary="Удалить узел" />
            </MenuItem>
        </Menu>
    );
}