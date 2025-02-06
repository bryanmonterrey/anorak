import React from "react";
import { Search } from 'lucide-react';
import { Link } from "next-view-transitions";

// Define the menu item type
interface MenuItem {
  name: string;
  link: string;
}

// Menu items array
const menuItems: MenuItem[] = [
  { name: "home", link: "/" },
  { name: "docs", link: "/docs" },
  { name: "x", link: "/services" },
  { name: "github", link: "/contact" },
];

// Menu Component
const Menu: React.FC = () => {
  return (
    <ul className="flex space-x-7">
      {menuItems.map((item, index) => (
        <li key={index} className="text-gray font-geist text-base hover:text-white transition-all ease-in-out duration-300">
          <Link href={item.link}>{item.name}</Link>
        </li>
      ))}
      <li className="text-gray hover:cursor-pointer text-sm flex items-center justify-center hover:text-white transition-all ease-in-out duration-300">
        <Search className="w-4 h-4" strokeWidth={2.5}/>
      </li>
    </ul>
  );
};

export default Menu;
