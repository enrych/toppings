import { useEffect, useState } from "react";
import "../index.css";

export default function ScrollToTop() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const scrollHandler = () => {
      setIsActive(window.scrollY > 150);
    };

    window.addEventListener("scroll", scrollHandler);

    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  const scrollUp = () => {
    window.scrollTo({
      top: 1,
      left: 0,
    });
  };

  return (
    <div className="box-border m-0 p-0 border-0 fixed bottom-14 right-4 z-50">
      {isActive && (
        <button
          onClick={scrollUp}
          className="box-border m-0 p-0 border-0 normal-case cursor-pointer rounded-full bg-white transition-transform hover:-translate-y-2 duration-150 ease-in-out shadow-lg flex items-center justify-center"
        >
          <img
            src={chrome.runtime.getURL("assets/icons/up-arrow.svg")}
            className="box-border m-0 p-0 border-0 max-w-full block align-middle size-20 select-none"
            alt="Scroll To Top"
            draggable="false"
          />
        </button>
      )}
    </div>
  );
}
