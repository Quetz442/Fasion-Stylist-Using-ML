import { useLocation, Link, useNavigate } from "react-router-dom";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

import { brainwave } from "../assets";
import { navigation } from "../constants";
import Button from "./Button";
import MenuSvg from "../assets/svg/MenuSvg";
import { HamburgerMenu } from "./design/Header";
import { useState } from "react";

const Header = () => {
  const location = useLocation(); // Get the current route
  const navigate = useNavigate(); // For navigation
  const [openNavigation, setOpenNavigation] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleNavigation = () => {
    if (openNavigation) {
      setOpenNavigation(false);
      enablePageScroll();
    } else {
      setOpenNavigation(true);
      disablePageScroll();
    }
  };

  const handleClick = () => {
    if (!openNavigation) return;

    enablePageScroll();
    setOpenNavigation(false);
  };

  const handleSignOut = () => {
    setDropdownOpen(false); // Close dropdown on sign out
    navigate("/"); // Redirect to home page
  };

  // Determine the button text and behavior based on the current route
  const renderButton = () => {
    if (location.pathname === "/") {
      // On the homepage
      return (
        <Button className="hidden lg:flex" onClick={() => navigate("/Sign")}>
          Sign In
        </Button>
      );
    } else if (location.pathname === "/Sign") {
      // On the login page, hide the button
      return null;
    } else {
      // On other pages (e.g., FitRec, Profile)
      return (
        <div className="relative">
          <Button
            className="hidden lg:flex"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Profile
          </Button>
          {dropdownOpen && (
            <ul className="absolute right-0 mt-2 bg-white border border-gray-200 rounded shadow-lg">
              <li>
                <Link
                  to="/Profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  My Profile
                </Link>
              </li>
              <li>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </li>
            </ul>
          )}
        </div>
      );
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 border-b border-n-6 lg:bg-n-8/90 lg:backdrop-blur-sm h-14 ${
        openNavigation ? "bg-n-8" : "bg-n-8/90 backdrop-blur-sm"
      }`}
    >
      <div className="flex items-center px-4 lg:px-6 xl:px-8 h-14">
        <a className="block w-[9rem] xl:mr-4" href="/">
          <img src={brainwave} width={150} height={16} alt="StyleAura" />
        </a>

        <nav
          className={`${
            openNavigation ? "flex" : "hidden"
          } fixed top-[4rem] left-0 right-0 bottom-0 bg-n-8 lg:static lg:flex lg:mx-auto lg:bg-transparent`}
        >
          <div className="relative z-2 flex flex-col items-center justify-center m-auto lg:flex-row">
            {location.pathname === "/" &&
              navigation.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  onClick={handleClick}
                  className={`block relative font-code text-base uppercase text-n-1 transition-colors hover:text-color-1 ${
                    item.onlyMobile ? "lg:hidden" : ""
                  } px-4 py-4 md:py-5 lg:-mr-0.25 lg:text-sm lg:font-semibold ${
                    item.url === location.hash
                      ? "z-2 lg:text-n-1"
                      : "lg:text-n-1/50"
                  } lg:leading-5 lg:hover:text-n-1 xl:px-7`}
                >
                  {item.title}
                </a>
              ))}
          </div>

          <HamburgerMenu />
        </nav>

        {renderButton()}

        <Button
          className="ml-auto lg:hidden"
          px="px-2"
          onClick={toggleNavigation}
        >
          <MenuSvg openNavigation={openNavigation} />
        </Button>
      </div>
    </div>
  );
};

export default Header;
