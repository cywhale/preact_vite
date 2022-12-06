// @unocss-include
import { memo } from "preact/compat";
import { useState, useEffect, useCallback } from "preact/hooks";

const getFirebaseAuth = () => import("./fbaseAuth.js");
const {
  auth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} = await getFirebaseAuth();
const googleAuthProvider = new GoogleAuthProvider();

const SignIn = (props) => {
  const { user, setUser } = props;
  const iconurl = `/favicon.png`;
  const renderFirePopup = useCallback((fireauth, fireprovider) => {
    signInWithPopup(fireauth, fireprovider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        setUser((preState) => ({
          ...preState,
          name: result.user.displayName,
          photoURL: result.user.photoURL,
          auth: "gmail",
          token: token,
        }));
      })
      .catch((error) => {
        if (user.auth === "") {
          console.log(
            "Gmail login error: ",
            error.code,
            "; ",
            error.message,
            " with ",
            error.email,
            " and ",
            error.credential
          );
          alert(
            "Gmail login error: Sometimes just connection failed, try sign in more times please."
          );
        }
      });
  }, []);

  return (
    <div class="flex flex-column flex-grow-1 justify-center">
      <img
        alt="Use Google account to sign in"
        referrerpolicy="no-referrer"
        class="max-w-100p h-auto"
        src={iconurl}
        width="60"
      />
      <div style="display:inline-block;">
        <button class="xbutton" onClick={renderRedirect}>
          ODB
        </button>
        <button
          class="xbutton"
          onClick={() => renderFirePopup(auth, googleAuthProvider)}
        >
          Google
        </button>
      </div>
    </div>
  );
};

const UserHandler = () => {
  const [user, setUser] = useState({
    name: "",
    auth: "",
    photoURL: "",
    token: "",
  });

  const waitFireAuth = () => {
    onAuthStateChanged(auth, (currUser) => {
      if (currUser) {
        return setUser((preState) => ({
          ...preState,
          name: currUser.displayName,
          photoURL: currUser.photoURL,
          auth: "gmail",
        }));
      }
      return null;
    });
  };

  const SignOut = () => {
    if (user.auth === "gmail") {
      signOut(auth);
    }
    setUser((preState) => ({
      ...preState,
      name: "",
      auth: "",
      photoURL: "",
      token: "",
    }));
  };

  useEffect(() => {
    waitFireAuth();
  }, []);

  const CurrUser = (props) => {
    const { name, photoURL } = props;
    return (
      <article class={style.currentUser}>
        <img
          alt={name}
          referrerpolicy="no-referrer"
          class={style.avatar}
          src={photoURL}
          width="60"
        />
        <button class="xbutton" onClick={SignOut}>
          Log out
        </button>
      </article>
    );
  };

  const Loginer = memo((props) => {
    const { name, photoURL } = props;

    return (
      <section class={style.flex}>
        {name === "" && <SignIn user={user} setUser={setUser} />}
        {name !== "" && (
          <div style="display:flex">
            <CurrUser name={name} photoURL={photoURL} />
          </div>
        )}
      </section>
    );
  });

  return <Loginer name={user.name} photoURL={user.photoURL} />;
};
