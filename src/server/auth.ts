import { gapi } from 'gapi-script';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const initGoogleClient = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client
        .init({
          clientId: CLIENT_ID,
          scope: 'email profile', // Minimal scopes for basic authentication
        })
        .then(() => {
          // Only check the sign-in status but don't automatically sign in
          const authInstance = gapi.auth2.getAuthInstance();
          if (authInstance.isSignedIn.get()) {
            resolve(); // User is already signed in, proceed
          } else {
            resolve(); // User is not signed in, but we're not signing them in automatically
          }
        })
        .catch((err: any) => reject(err));
    });
  });
};

