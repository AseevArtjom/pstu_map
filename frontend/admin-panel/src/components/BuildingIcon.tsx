import ApartmentIcon from '@mui/icons-material/Apartment';
import { BASE_URL } from "../http.ts";

interface BuildingIconProps {
    iconPath: string | null;
    iconColor: string;
}

export default function BuildingIcon({ iconPath, iconColor }: BuildingIconProps) {
    if (!iconPath) {
        return (
            <ApartmentIcon
                sx={{
                    color: iconColor,
                }}
            />
        );
    }

    return (
        <div style={{
            width: 24,
            height: 24,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }}>
            <img
                src={`${BASE_URL}${iconPath}`}
                alt=""
                style={{
                    width: '24px',
                    height: '24px',
                    filter: `drop-shadow(24px 0 0 ${iconColor})`,
                    transform: `translateX(-24px)`,
                }}
            />
        </div>
    );
}