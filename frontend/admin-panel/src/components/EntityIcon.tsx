import ApartmentIcon from '@mui/icons-material/Apartment';
import { BASE_URL } from "../http.ts";

interface EntityIconProps {
    iconPath: string | null;
    iconColor: string;
    size?: number;
}

export default function EntityIcon({ iconPath, iconColor, size = 24 }: EntityIconProps) {
    if (!iconPath) {
        return (
            <ApartmentIcon
                sx={{ color: iconColor, fontSize: size }}
            />
        );
    }

    return (
        <div style={{
            width: size,
            height: size,
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
                    width: `${size}px`,
                    height: `${size}px`,
                    filter: `drop-shadow(${size}px 0 0 ${iconColor})`,
                    transform: `translateX(-${size}px)`,
                }}
            />
        </div>
    );
}