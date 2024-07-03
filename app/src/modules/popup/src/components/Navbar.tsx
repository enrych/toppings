import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 p-[10px] bg-[#18181b] h-[60px] w-full`}
    >
      <nav className="w-full flex justify-evenly items-center">
        <Link
          className={`flex items-center gap-2 font-medium text-foreground hover:bg-[#3d3d43]/50 px-3 py-2 rounded-md cursor-pointer ${location.pathname === "/" ? "bg-[#3d3d43]/50" : ""}`}
          to="/"
        >
          <img
            src={chrome.runtime.getURL("assets/icons/home.svg")}
            alt="Home"
          />
        </Link>
        <Link
          className={`flex items-center gap-2 font-medium text-foreground hover:bg-[#3d3d43]/50 px-3 py-2 rounded-md cursor-pointer ${location.pathname === "/notifications" ? "bg-[#3d3d43]/50" : ""}`}
          to="/Notifications"
        >
          <img
            src={chrome.runtime.getURL("assets/icons/bell.svg")}
            alt="Bell"
          />
        </Link>
        <button
          className="flex items-center gap-2 font-medium text-foreground hover:bg-[#3d3d43]/50 px-3 py-2 rounded-md cursor-pointer"
          onClick={() => {
            window.open("https://enrych.github.io/toppings-web/");
          }}
        >
          <img
            src={chrome.runtime.getURL("assets/icons/help.svg")}
            alt="Help"
          />
        </button>
        <button
          className="flex items-center gap-2 font-medium text-foreground hover:bg-[#3d3d43]/50 px-3 py-2 rounded-md cursor-pointer"
          onClick={() => {
            window.open(chrome.runtime.getURL("options/index.html"));
          }}
        >
          <img
            src={chrome.runtime.getURL("assets/icons/gear.svg")}
            alt="Settings"
          />
        </button>
      </nav>
    </div>
  );
}
