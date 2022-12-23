// @unocss-include
import { memo } from "preact/compat"
import { useEffect, useCallback } from "preact/hooks"
import useLogin from './useLogin'
import SignIn from './SignIn'

const getFirebaseAuth = () => import("./fbaseAuth.js")
const { auth, onAuthStateChanged, signOut } = await getFirebaseAuth()

const iconurl = `/pwa-192x192.png`

const UserHandler = (props) => {
  const user = { name: useLogin(useCallback(state => state.name, [])),
                 photoURL: useLogin(useCallback(state => state.photoURL, [])),
                 //token: useLogin(useCallback(state => state.token, []))
               }
  const setUser = (opts) => useLogin.getState().setLogin(opts)

  const waitFireAuth = () => {
    onAuthStateChanged(auth, (currUser) => {
      if (currUser) {
        return setUser({ //(preState) => ({
          //...preState,
          name: currUser.displayName,
          photoURL: currUser.photoURL,
          auth: "gmail",
        })
      }
      return null
    })
  }

  const SignOut = () => {
    signOut(auth)
    setUser({ //(preState) => ({
      //...preState,
      name: "",
      photoURL: {iconurl},
      token: "",
    })
  }

  useEffect(() => {
    waitFireAuth()
  }, [])

  const CurrUser = (props) => {
    const { name, photoURL } = props
    return (
      <article class="flex items-bottom self-stretch justify-center flex-col pt">
        <img
          alt={name}
          referrerpolicy="no-referrer"
          class="avatar"
          src={photoURL}
          width="60"
        />
        <button class="btn" onClick={SignOut}>
          Log out
        </button>
      </article>
    )
  }

  const Loginer = memo((props) => {
    const { name, photoURL } = props

    return (
      <section class="flex flex-glow-1 flex-col">
        {name === "" && <SignIn />}
        {name !== "" && (
          <div class="flex">
            <CurrUser name={name} photoURL={photoURL} />
          </div>
        )}
      </section>
    )
  })

  return <Loginer name={user.name} photoURL={user.photoURL} />
}
export default UserHandler
