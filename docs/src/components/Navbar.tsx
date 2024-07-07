import React from "react";

const Navbar = () => {
  return (
    <nav className="sticky top-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-gray-900">
              Brand
            </a>
          </div>
          <div className="flex">
            <a
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700"
            >
              Home
            </a>
            <a
              href="/about"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700"
            >
              About
            </a>
            <a
              href="/contact"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
