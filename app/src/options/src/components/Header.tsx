import headerIcon from "../assets/icons8-settings-64.png";

function Header({ version }) {
  return (
    <header className="fixed top-0 left-0 right-0 w-full flex justify-between items-center p-5 bg-white shadow-md z-10">
      <div className="flex items-center">
        <img src={headerIcon} alt="Toppings Logo" className="h-10 mr-3" />
        <h1 className="text-2xl font-bold">Preferences</h1>
        <div className="ml-3 text-xs text-gray-500">
          <p>
            v<span id="version">{version}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <svg className="h-6 w-6 text-gray-500 mr-2" viewBox="0 0 24 24">
          <g>
            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
          </g>
        </svg>
        <input
          placeholder="Search"
          type="search"
          className="border border-gray-300 rounded-md p-2"
        />
      </div>
    </header>
  );
}

export default Header;
