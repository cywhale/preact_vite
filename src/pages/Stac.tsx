import { setCatchHandler } from "workbox-routing";
import STACImageFinder from "../components/STACImageFinder.jsx";
function Stac() {
  // replaced dyanmicaly
  const date = "__DATE__";
  return (
    <div className="About">
      <STACImageFinder />
      <br />
      <a href="/cli">Go Home</a>
    </div>
  );
}

export default Stac;
