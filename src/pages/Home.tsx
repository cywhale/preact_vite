import { signal, effect } from '@preact/signals';
import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import './Home.css'

const themeSel = signal('light')
const selectTheme = () => {
  let themeval = themeSel.value === 'light'? 'dark' : 'light';
  const root = window.document.documentElement;
  const isDark = themeval === 'dark';
  root.classList.remove(isDark? 'light' : 'dark');
  root.classList.add(themeval);
  themeSel.value = themeval
}

function Home() {
  const [count, setCount] = useState(0)

  const [name, setName] = useState('')

  // @ts-expect-error just ignore
  const handleChange = (event) => {
    setName(event.target.value || '')
  }

  // @ts-expect-error just ignore
  const handleSubmit = (event) => {
    event.preventDefault()
    if (name)
      route(`/hi/${name}`)
  }

  return (
    <div className="Home bg-base">
      <p>
        <button className="btn-blue" type="button" onClick={() => setCount(count => count + 1)}>
            count is: {count}
        </button>
      </p>
      <br />
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={handleChange} type="text" aria-label="What's your name?" placeholder="What's your name?" />
        <button className="btn-blue-500" type="submit">GO</button>
      </form>
      <br/>
      <a className="dark:text-sky-300 dark:visited:text-violet-400" href="/about">About</a>
      <br/><br/>
      <div>
        <button className="i-carbon-moon dark:i-carbon-sun dark:text-white fill-white" type="submit" onClick={selectTheme} />
      </div>
    </div>
  )
}

export default Home
