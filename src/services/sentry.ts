import * as Sentry from '@sentry/react-native';

export const navigationIntegration = Sentry.reactNavigationIntegration();

export const initSentry = () => {
    if (!process.env.EXPO_PUBLIC_SENTRY_DSN) {
        console.warn('Sentry DSN is missing, skipping initialization');
        return;
    }

    Sentry.init({
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        debug: __DEV__,
        tracesSampleRate: 1.0,
        _experiments: {
            profilesSampleRate: 1.0,
        },
        integrations: [
            navigationIntegration,
        ],
        enableNative: !__DEV__, // Disable native integration in dev to avoid noise if needed, or keep it true
    });
};
