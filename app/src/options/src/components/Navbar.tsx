import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="w-full bg-black flex justify-between p-4">
      <h1 className="text-2xl">Toppings</h1>
      <nav>
        <ul>
          <li>
            <Link to="home">Home</Link>
            <Link to="land">Land</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
