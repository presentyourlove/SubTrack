import { useDatabase } from '../context/DatabaseContext';

export function usePrivacy() {
    const { settings } = useDatabase();
    const isPrivacyMode = settings?.privacyMode ?? false;

    const maskValue = (value: string | number) => {
        if (isPrivacyMode) {
            return '****';
        }
        return value;
    };

    return { isPrivacyMode, maskValue };
}
