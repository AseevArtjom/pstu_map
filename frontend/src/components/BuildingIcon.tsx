import ApartmentIcon from '@mui/icons-material/Apartment';

interface BuildingIconProps {
    iconPath: string | null;
    hovered: boolean;
}

export default function BuildingIcon({ iconPath, hovered }: BuildingIconProps) {
    if (!iconPath) {
        return (
            <ApartmentIcon
                sx={{
                    mr: 2,
                    color: "#2F80ED",
                    transition: 'color 0.2s'
                }}
            />
        );
    }

    return (
        <img
            src={`http://localhost:8082${iconPath}`}
            alt=""
            style={{
                width: 24,
                height: 24,
                marginRight: '16px',
                objectFit: 'contain',
                transition: 'filter 0.2s, opacity 0.2s',
                filter: 'invert(44%) sepia(91%) saturate(1243%) hue-rotate(197deg) brightness(96%) contrast(93%)',
                opacity: hovered ? 0.8 : 1
            }}
        />
    );
}