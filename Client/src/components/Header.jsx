import { Fragment, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, Link, NavLink } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import useContent from "../hooks/useContent";
import axios from "../api/axios";
import jwtDecode from "jwt-decode";

const user = {
  name: "Tom Cook",
  email: "tom@example.com",
  imageUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
};

const navigation = [
  {
    name: "Dashboard",
    link: "#",
    current: true,
    isProtected: false,
    roles: [1000],
  },
  {
    name: "Team",
    link: "projects",
    current: false,
    isProtected: false,
    roles: [1000],
  },
  {
    name: "Projects",
    link: "#",
    current: false,
    isProtected: false,
    roles: [1000],
  },
  {
    name: "Calendar",
    link: "#",
    current: false,
    isProtected: false,
    roles: [1000],
  },
  {
    name: "Reports",
    link: "yourTaskData",
    current: false,
    isProtected: false,
    roles: [1000],
  },
  {
    name: "Admin",
    link: "data",
    current: false,
    isProtected: true,
    roles: [5150],
  },
  {
    name: "Allied Checker",
    link: "allied-checker",
    current: false,
    isProtected: true,
    roles: [5150],
  },
];
const userNavigation = [
  { name: "Your Profile", link: "#" },
  { name: "Settings", link: "#" },
  { name: "Sign out", link: "#" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Header = () => {
  const { auth } = useContent();
  const navigate = useNavigate();
  const logout = useLogout();

  const signout = async () => {
    await logout();
    navigate("/");
    console.log("❌ Logged Out Successfully ❌");
  };

  const handleNavigation = (link) => {
    if (link === "yourTaskData" || link === "projects") {
      navigate(link);
    } else {
      // Handle other navigation logic
    }
  };

  const filterNav = () => {
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const roles = decoded?.UserInfo?.roles || [];

    let nav = navigation.filter((ele) => {
      if (auth?.accessToken) {
        if (roles?.find((role) => ele.roles.includes(role))) {
          return true;
        } else {
          return false;
        }
      } else {
        if (!ele.isProtected) {
          return true;
        } else {
          return false;
        }
      }
    });
    return nav;
  };

  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="rounded-b-3xl bg-gray-800 py-6">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {filterNav().map((item) => (
                          <NavLink
                            to={`/${item.link}`}
                            key={item.name}
                            className={classNames(
                              item.current
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "rounded-md px-3 py-2 text-sm font-medium"
                            )}
                            // onClick={() => handleNavigation(item.href)}
                          >
                            {item.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      <button
                        type="button"
                        className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>

                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex max-w-xs items-center rounded-full text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800">
                            <span className="sr-only">Open user menu</span>
                            <img
                              className="h-8 w-8 rounded-full"
                              src={user.imageUrl}
                              alt=""
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <Link
                                    link={item.link}
                                    className={classNames(
                                      active ? "bg-gray-100" : "",
                                      "block px-4 py-2 text-sm text-gray-700"
                                    )}
                                    onClick={() =>
                                      item.name === "Sign out"
                                        ? signout()
                                        : null
                                    }
                                  >
                                    {item.name}
                                  </Link>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-900 p-2 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                  {filterNav().map((item) => (
                    <Link
                      key={item.name}
                      to={item.link}
                      className={classNames(
                        item.current
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "block rounded-md px-3 py-2 text-base font-medium"
                      )}
                      // onClick={}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-gray-700 pb-3 pt-4">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.imageUrl}
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">
                        {user.name}
                      </div>
                      <div className="text-sm font-medium leading-none text-gray-400">
                        {user.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ml-auto flex-shrink-0 bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1">
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.link}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                        onClick={() => {
                          if (item.name === "Sign out") {
                            signout();
                          } else {
                            handleNavigation(item.href);
                          }
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </>
  );
};

export default Header;
