import create from 'zustand'

const iconurl = `/pwa-192x192.png`

const useLogin = create(set => ({
  name: '',
  photoURL: iconurl,
  token: '',
  setLogin: (opt) => set(opt)
}))
export default useLogin

