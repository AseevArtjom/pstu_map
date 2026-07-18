import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SwapVertIcon from '@mui/icons-material/SwapVert';
import LinkOffIcon from '@mui/icons-material/LinkOff';

interface NodeContextMenuProps {
    mouseX: number;
    mouseY: number;
    onClose: () => void;
    onDelete: () => void;
    onStartInterFloorLink: () => void;
    onDeleteInterFloorLink?: () => void;
}

export default function NodeContextMenu({
                                            mouseX, mouseY, onClose, onDelete, onStartInterFloorLink, onDeleteInterFloorLink
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
            {!onDeleteInterFloorLink && (
                <MenuItem onClick={() => { onStartInterFloorLink(); onClose(); }}>
                    <ListItemIcon><SwapVertIcon sx={{ color: '#2F80ED' }} /></ListItemIcon>
                    <ListItemText primary="Связать с другим этажом..." />
                </MenuItem>
            )}

            {onDeleteInterFloorLink && (
                <MenuItem onClick={() => { onDeleteInterFloorLink(); onClose(); }} sx={{ color: '#F44336' }}>
                    <ListItemIcon><LinkOffIcon sx={{ color: '#F44336' }} /></ListItemIcon>
                    <ListItemText primary="Удалить связь между этажами" />
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