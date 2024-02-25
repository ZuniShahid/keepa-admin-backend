import { initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore/lite';
import type { EnvConfig } from './config';

declare module 'fastify' {
  // eslint-disable-next-line no-unused-vars
  interface FastifyInstance {
    firebase: Firestore;
  }
}

export default function initFirestore(config: EnvConfig) {
  const app = initializeApp({
    apiKey: config.API_KEY,
    appId: config.APP_ID,
    messagingSenderId: '123384061557',
    projectId: 'keepa-lean',
    authDomain: 'keepa-lean.firebaseapp.com',
    storageBucket: 'keepa-lean.appspot.com',
    measurementId: 'G-K55VLHWF0B',
  });
  return getFirestore(app);
}
