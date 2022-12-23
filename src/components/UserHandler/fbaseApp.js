import * as firebaseApp from "firebaseApp"
import { firebaseConfig } from './.credentials.development.js'

const { initializeApp, getApp, getApps } = firebaseApp

let fbapp

if (getApps().length) {
  fbapp = getApp()
} else {
  fbapp = initializeApp(firebaseConfig)
}

export const fbaseapp = fbapp
