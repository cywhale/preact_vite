import { useCallback } from 'preact/hooks'
import useLogin from './useLogin'

const getFirebaseAuth = () => import("./fbaseAuth.js")
const { auth, signInWithPopup, GoogleAuthProvider} = await getFirebaseAuth()
const googleAuthProvider = new GoogleAuthProvider()

const iconurl = `/pwa-192x192.png`

const SignIn = (props) => {
  //const user = { name: useLogin(useCallback(state => state.name, [])),
  //               photoURL: useLogin(useCallback(state => state.photoURL, [])),
  //               //token: useLogin(useCallback(state => state.token, []))
  //             }
  const setUser = (opts) => useLogin.getState().setLogin(opts)

  const renderFirePopup = useCallback((fireauth, fireprovider) => {
    signInWithPopup(fireauth, fireprovider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const token = credential.accessToken

      setUser({ //(preState) => ({
        //...preState,
        name: result.user.displayName,
        photoURL: result.user.photoURL,
        token: token
      }) //)
    }).catch((error) => { // Handle Errors here.
      console.log("Gmail login error: ", error.code, "; ", error.message, " with ", error.email, " and ", error.credential)
      alert("Gmail login error: Sometimes just connection failed, try sign in more times please.")
    })
  }, [])

  return(
      <div class="flex items-bottom self-stretch justify-center flex-col pt">
          <img alt="Use Google account to sign in"
             referrerpolicy="no-referrer"
             class="avatar"
             src={iconurl}
             width="60" />
          <div class="inline-flex">
            <button class="btn"
               onClick={() => renderFirePopup(auth, googleAuthProvider)}>
               Google</button>
          </div>
      </div>
  )
}
export default SignIn
