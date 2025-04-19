export const buildSessionKey = (environmentId: string) => {
    return `user_session_${environmentId}`;
};