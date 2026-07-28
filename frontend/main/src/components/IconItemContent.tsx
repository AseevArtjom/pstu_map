import { BASE_URL } from "../http";


export default function IconItemContent({ filePath }: { filePath: string }) {
    return (
        <img
            src={`${BASE_URL}${filePath}`}
            alt="icon"
            style={{ width: 20, height: 20, filter: 'invert(1) brightness(100%)' }}
        />
    );
}