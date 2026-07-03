import { useLogto } from '@logto/react';
import { useCallback } from 'react';

export function useAuthService() {
    const { signOut, getIdTokenClaims, isAuthenticated, isLoading } = useLogto();

    const logout = useCallback(() => {
        signOut(window.location.origin);
    }, [signOut]);
    const checkHasRole = useCallback(async (roleName: string): Promise<boolean> => {
        try {
            const claims = await getIdTokenClaims();
            return claims?.roles?.includes(roleName) ?? false;
        } catch (error) {
            console.error("Ошибка при проверке прав пользователя:", error);
            return false;
        }
    }, [getIdTokenClaims]);

    return {
        logout,
        checkHasRole,
        isAuthenticated,
        isLoading,
        getIdTokenClaims
    };
}