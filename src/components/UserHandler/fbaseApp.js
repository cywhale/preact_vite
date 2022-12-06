import * as firebaseApp from "firebaseApp";
const { initializeApp, getApp, getApps } = firebaseApp;

firebaseConfig = {};

let fbapp;

if (getApps().length) {
  fbapp = getApp();
} else {
  fbapp = initializeApp(firebaseConfig);
}

export const fbaseapp = fbapp;
