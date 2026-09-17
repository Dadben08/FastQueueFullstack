import React, { useState } from "react";
import logo from "../assets/img/logo.png";
import { navItems } from "../constants";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
    setMobileDropdownOpen(null);
  };
  const handleScrollNavigation = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setMobileDrawerOpen(false);
    setMobileDropdownOpen(null);
  };
  const toggleMobileDropdown = (index) => {
    setMobileDropdownOpen(mobileDropdownOpen === index ? null : index);
  };
  return (
    <div className="navbar" id="Navbar">
      
      <nav className="header fixed top-0 left-0 w-full bg-white shadow-md z-50">
        
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
         
          {/* LOGO */}
          <div className="flex-shrink-0">
           
            <img src={logo} alt="FastQueues" className="h-16 w-auto" />
          </div>
          {/* DESKTOP NAV */}
          <ul className="hidden lg:flex space-x-12 font-sub text-[#2f2a76] justify-center flex-1">
            
            {navItems.map((item, index) => (
              <li key={index} className="relative group">
                
                {item.dropdown ? (
                  <span className="cursor-pointer transition-colors hover:text-orange-600">
                    
                    {item.label}
                  </span>
                ) : item.path ? (
                  <RouterLink
                    to={item.path}
                    className="cursor-pointer transition-colors hover:text-orange-600"
                  >
                    
                    {item.label}
                  </RouterLink>
                ) : item.href === "/" ? (
                  <RouterLink
                    to="/"
                    className="cursor-pointer transition-colors hover:text-orange-600"
                  >
                    
                    {item.label}
                  </RouterLink>
                ) : (
                  <button
                    onClick={() =>
                      handleScrollNavigation(item.href.replace("#", ""))
                    }
                    className="cursor-pointer transition-colors hover:text-orange-600 bg-transparent border-none p-0"
                  >
                    
                    {item.label}
                  </button>
                )}
                {/* DESKTOP DROPDOWN */}
                {item.dropdown && (
                  <ul className="absolute left-0 top-full bg-white shadow-lg rounded-lg py-3 px-2 w-56 z-50 hidden group-hover:flex flex-col">
                    
                    {item.dropdown.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        
                        {subItem.path ? (
                          <RouterLink
                            to={subItem.path}
                            className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded"
                          >
                            
                            {subItem.label}
                          </RouterLink>
                        ) : (
                          <button
                            onClick={() =>
                              handleScrollNavigation(
                                subItem.href.replace("#", ""),
                              )
                            }
                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded bg-transparent border-none cursor-pointer"
                          >
                            
                            {subItem.label}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          {/* DESKTOP AUTH BUTTONS */}{" "}
          <div className="hidden lg:flex space-x-8 items-center">
            
            <RouterLink
              to="/login"
              className="font-sub text-[#2f2a76] hover:text-[#F4400D]"
            >
              
              Sign In
            </RouterLink>
            <RouterLink
              to="/regdashboard"
              className="px-10 py-4 bg-[#F4400D] text-white rounded-full font-semibold hover:bg-transparent hover:text-[#F4400D] hover:border-[#F4400D] border"
            >
             
              Join Queue
            </RouterLink>
          </div>
          {/* MOBILE MENU BUTTON */}
          <div className="lg:hidden">
            
            <button
              onClick={toggleNavbar}
              className="text-[#2f2a76]"
              aria-label="Toggle menu"
            >
              
              {mobileDrawerOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
        {/* MOBILE DROPDOWN MENU */}
        {mobileDrawerOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            
            <ul className="px-6 py-5 space-y-2">
              
              {navItems.map((item, index) => (
                <li key={index}>
                  
                  {/* ITEM WITH DROPDOWN */}
                  {item.dropdown ? (
                    <>
                      
                      <button
                        onClick={() => toggleMobileDropdown(index)}
                        className="w-full flex items-center justify-between py-3 text-[#2f2a76] font-medium bg-transparent border-none cursor-pointer"
                      >
                        
                        <span>{item.label}</span>
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-200 ${mobileDropdownOpen === index ? "rotate-180" : ""}`}
                        />
                      </button>
                      {/* MOBILE SUBMENU */}
                      {mobileDropdownOpen === index && (
                        <ul className="ml-4 mb-2 border-l-2 border-[#f43f0d0b]  pl-4 space-y-1">
                          
                          {item.dropdown.map((subItem, subIndex) => (
                            <li key={subIndex}>
                              
                              {subItem.path ? (
                                <RouterLink
                                  to={subItem.path}
                                  onClick={() => {
                                    setMobileDrawerOpen(false);
                                    setMobileDropdownOpen(null);
                                  }}
                                  className="block py-2 text-gray-600 hover:text-[#F4400D]"
                                >
                                  
                                  {subItem.label}
                                </RouterLink>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleScrollNavigation(
                                      subItem.href.replace("#", ""),
                                    )
                                  }
                                  className="block w-full text-left py-2 text-gray-600 hover:text-[#F4400D] bg-transparent border-none cursor-pointer"
                                >
                                 
                                  {subItem.label}
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : item.path ? (
                    /* NORMAL PAGE LINK */ <RouterLink
                      to={item.path}
                      onClick={() => setMobileDrawerOpen(false)}
                      className="block py-3 text-[#2f2a76] font-medium hover:text-[#F4400D]"
                    >
                     
                      {item.label}
                    </RouterLink>
                  ) : item.href === "/" ? (
                    /* HOME LINK */ <RouterLink
                      to="/"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="block py-3 text-[#2f2a76] font-medium hover:text-[#F4400D]"
                    >
                      
                      {item.label}
                    </RouterLink>
                  ) : (
                    /* SCROLL LINK */ <button
                      onClick={() =>
                        handleScrollNavigation(item.href.replace("#", ""))
                      }
                      className="block w-full text-left py-3 text-[#2f2a76] font-medium hover:text-[#F4400D] bg-transparent border-none cursor-pointer"
                    >
                     {item.label}
                    </button>
                  )}
                </li>
              ))}
              {/* MOBILE AUTH */}
              <li className="pt-4 mt-3 border-t border-gray-200">
                
                <div className="flex flex-col gap-3">
                  
                  <RouterLink
                    to="/login"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="text-center py-3 border border-[#F4400D] text-[#F4400D] rounded-full font-medium"
                  >
                    
                    Sign In
                  </RouterLink>
                  <RouterLink
                    to="/company-registration"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="text-center py-3 bg-[#F4400D] text-white rounded-full font-medium"
                  >
                    
                    Join Queue
                  </RouterLink>
                </div>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
};
export default Navbar;
