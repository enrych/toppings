import Image from "next/image";
import { akronim } from "./src/lib/fonts";
import toppingsLogo from "./public/assets/icons/icon512.png";

const nextraConfig = {
  // banner: {
  //   key: "",
  //   text: (
  //     <a href="" target="_blank">
  //
  //     </a>
  //   ),
  // },
  darkMode: false,
  nextThemes: {
    defaultTheme: "light",
    enableSystem: false,
  },
  docsRepositoryBase: "https://github.com/enrych/toppings/tree/main/docs",
  footer: {
    text: (
      <span>
        GPL-3.0 License {new Date().getFullYear()} ©{" "}
        <a href="https://enrych.github.io/toppings" target="_blank">
          Toppings
        </a>
        .
      </span>
    ),
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Toppings" />
      <meta property="og:description" content="Your Web, Your Way" />
    </>
  ),
  logo: (
    <>
      <Image src={toppingsLogo} alt="Toppings Logo" width={40} height={40} />
      <span
        className={akronim.className}
        style={{
          fontSize: "36px",
        }}
      >
        Toppings
      </span>
    </>
  ),
  project: {
    link: "https://github.com/enrych/toppings",
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s | Toppings",
    };
  },
};

export default nextraConfig;
