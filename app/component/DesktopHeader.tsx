import React, { useState } from "react";
import Image from "next/image";
import { CiSettings } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import { RiMenu2Line } from "react-icons/ri";
import { IoCloseOutline } from "react-icons/io5";
import LeftSideBarMobile from "./LeftSideBarMobile";
import DynamicBreadCrum from "./DynamicBreadCrum";

import { usePathname } from "next/navigation";
import AxiosProvider from "../../provider/AxiosProvider";
import { toast } from "react-toastify";
import { LuSearchX } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";

const DesktopHeader = () => {
  const [isFlyoutFilterOpen, setFlyoutFilterOpen] = useState<boolean>(false);
  const toggleFilterFlyout = () => setFlyoutFilterOpen(!isFlyoutFilterOpen);
  const pathname = usePathname();
    const [query, setQuery] = useState("");
      const handleSearch = async () => {
    if (!query)
    {
      toast.error("Please enter email or mobile ");
  return;
    }
    

    // basic type check
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query);
    const isPhone = /^\d{10}$/.test(query);
    if (!isEmail && !isPhone) {
      toast.error("Enter a valid email or 10-digit mobile number");
      return;
    }

    try {
      const res = await AxiosProvider.get(
        `/leads/search/dashboard?q=${query}`
      );
    // console.log("Search result:", res.data.data.leads[0].id);
      const searchId = res.data.data.leads[0].id;
     window.open(`/leadsdetails?id=${searchId}`, "_blank"); // "_blank" = new tab
    } catch (err) {
      console.error("Search failed:", err);
       toast.error("No lead found");
    }
  };
  return (
    <>
      <div className=" w-full flex justify-between  items-center gap-7 md:mb-14">
        <div className="w-full h-24 bg-[linear-gradient(206deg,#ffd700_28.85%,rgba(245,247,248,0)_89.55%)] p-6 rounded-lg text-white opacity-20 absolute top-0 left-0 right-0 "></div>
        {/* SEARCH INPUT WITH ICON */}
        <div className=" hidden md:block md:w-auto">
          <DynamicBreadCrum />
        </div>
        <div className=" hidden md:w-auto md:flex md:justify-end md:items-center md:gap-7 w-auto z-10">
       <div className="flex gap-2">
<input
  type="text"
  placeholder="Search for email, mobile"
  className="bg-black w-64 h-[50px] rounded-[4px] px-6 border border-gray-700 hover:shadow-hoverInputShadow focus:border-primary placeholder-gray-400 text-white text-[15px] leading-normal outline-none"
  value={query}
  onChange={(e) => setQuery(e.target.value.trim())}
/>

      <button
        type="button"
        className="bg-primary text-white px-4 rounded bg-primary-600 hover:bg-primary-700"
        onClick={handleSearch}
      >
       <FaSearch />
      </button>
    </div>
          {/* <div className=" w-[50px] h-[50px] bg-white rounded-full flex justify-center items-center">
            <CiSettings className=" text-[#718EBF] w-[25px] h-[25px]" />
          </div> */}
          <div className=" w-[50px] h-[50px] bg-primary-600 hover:bg-primary-700 rounded-full flex justify-center items-center">
            <IoIosNotificationsOutline className=" text-white w-[25px] h-[25px]" />
          </div>
          {/* <div className=" w-[50px] h-[50px]  rounded-full flex justify-center items-center z-10">
            <Image
              src="/images/dummy-image.jpg"
              alt="Orizon profile"
              width={50}
              height={50}
              className="rounded-full border-2 border-primary-500"
            />
          </div> */}
        </div>
        <RiMenu2Line
          onClick={toggleFilterFlyout}
          className="text-black text-xl cursor-pointer md:hidden z-20"
        />
        <div className=" md:hidden w-[50px] h-[50px]  rounded-full flex justify-center items-center z-10">
          <Image
            src="/images/dummy-image.jpg"
            alt="Orizon profile"
            width={50}
            height={50}
            className="rounded-full border-2 border-primary-500"
          />
        </div>
      </div>
      <div className="w-full mt-1 mb-4 md:hidden z-[30]">
        <DynamicBreadCrum />
      </div>
      {/* LEFT SIDEBAR MENU */}
      {isFlyoutFilterOpen && (
        <>
          <div
            className=" min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
            onClick={() => {
              setFlyoutFilterOpen(!isFlyoutFilterOpen);
            }}
          ></div>
          <div
            className={`leftSideBar ${
              isFlyoutFilterOpen ? "leftSideBarOpen" : ""
            }`}
          >
            <div className=" w-full flex min-h-auto">
              {/* Flyout content here */}
              <LeftSideBarMobile />
              <IoCloseOutline
                onClick={toggleFilterFlyout}
                className=" h-8 w-8 border border-[#E7E7E7] text-[#0A0A0A] rounded cursor-pointer absolute top-[69px] right-4"
              />
            </div>
          </div>
        </>
      )}
      {/*  LEFT SIDEBAR MENU END */}
    </>
  );
};

export default DesktopHeader;
