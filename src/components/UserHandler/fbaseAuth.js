import * as firebaseAuth from "firebaseAuth";
import { fbaseapp } from "./fbaseApp.js";

const { getAuth } = firebaseAuth;

export const {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} = firebaseAuth;

export const auth = getAuth(fbaseapp);
