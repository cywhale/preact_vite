import { Router } from "preact-router";
import { createBrowserHistory } from "history";
import ReloadPrompt from "./ReloadPrompt";
import Home from "./pages/Home";
import Stac from "./pages/Stac";
import Hi from "./pages/hi/[name]";

import "./App.css";
import "uno.css";

const history = createBrowserHistory({
  basename: "cli/", //process.env.PUBLIC_URL
});

export function App() {
  // replaced dyanmicaly
  // <ReloadPrompt /> //if disable SW(PWA)
  const date = "__DATE__";
  return (
    <>
      <main className="App">
        <img src="/cli/favicon.svg" alt="PWA Logo" width="60" height="60" />
        <h1 className="Home-title">PWA Preact!</h1>
        <div className="Home-built">Built at: {date}</div>
        <Router history={history}>
          <Home default path="/cli" />
          <Stac path="/cli/stac" />
          <Hi path="/cli/hi/:name" />
        </Router>
        <ReloadPrompt />
      </main>
    </>
  );
}
