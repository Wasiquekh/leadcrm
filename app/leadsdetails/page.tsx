"use client";
import Image from "next/image";
import Tabs from "../component/Tabs";
import { CiSettings } from "react-icons/ci";
import {
  IoIosCall,
  IoIosMail,
  IoIosNotificationsOutline,
  IoMdClose,
} from "react-icons/io";
import { SetStateAction, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FaNotesMedical, FaRegEye, FaStar, FaTasks } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import LeftSideBar from "../component/LeftSideBar";
import UserActivityLogger from "../../provider/UserActivityLogger";
import { MdLocationPin, MdVerified } from "react-icons/md";
import { TbActivity, TbTopologyStarRing2 } from "react-icons/tb";
import { PiMapPinLight, PiNotepadLight } from "react-icons/pi";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { useSearchParams } from "next/navigation";
import AxiosProvider from "../../provider/AxiosProvider";
//import CustomerViewDetails from "../component/CustomerViewDetails";
import ReactPlayer from "react-player";
import DesktopHeader from "../component/DesktopHeader";
import { Tooltip } from "react-tooltip";
import { FaEllipsisVertical } from "react-icons/fa6";
import { AppContext } from "../AppContext";
import { GrPowerReset } from "react-icons/gr";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";
import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), { ssr: false });
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import StorageManager from "../../provider/StorageManager";
import OtpInput from "react-otp-input";
import { FiFilter } from "react-icons/fi";
import { LuSquareActivity } from "react-icons/lu";
import { IoCloseOutline } from "react-icons/io5";
import AppCalendar from "../component/AppCalendar";




export default function Home() {
  const [isFlyoutFilterOpen, setFlyoutFilterOpen] = useState<boolean>(false);
  const isChecking = useAuthRedirect();

  //console.log("@@@@@@@@@@@@@@@@@@@@", customer);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const storage = new StorageManager();

  const [isCustomerViewDetailOpen, setIsCustomerViewDetailOpen] =
    useState<boolean>(false);



  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalOpenVideo, setIsModalOpenVideo] = useState<boolean>(false);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [hitApi, setHitApi] = useState<boolean>(true);
  //console.log('BBBBBBBBBBBBB',isModalOpenVideo)
  const [modalImage, setModalImage] = useState<string>("");
  //const [isLoading, setIsLoading] = useState<boolean>(false);

  const [imageKey, setImageKey] = useState(Date.now());
  const [editInfo, setEditInfo] = useState<boolean>(true);
  const [secretKey, setSecretKey] = useState<string | null>(
    storage.getDecryptedUserSecretKey()
  );
  const [userId, setuserId] = useState<string | undefined>(storage.getUserId());
  const [totp, setTotp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isTotpPopupOpen, setIsTotpPopupOpen] = useState<boolean>(false);
  

  const toggleFilterFlyout = () => setFlyoutFilterOpen(!isFlyoutFilterOpen);

  const handleChange = (value: string) => {
    setTotp(value);
  };






  const tabs = [
    {
      label: "Activity History",
      content: (
        <>
          {/* Tab content 3 */}
          <div className="container mx-auto p-4">
            <h2 className="text-base  font-semibold mb-4 text-secondBlack">
              Today
            </h2>
            <div className="w-full flex gap-8 hover:bg-primary-100 py-2 px-2 text-base rounded">
              <div className=" flex gap-2 ">
                <div>
                  <TbActivity className=" bg-primary-500 text-white p-1 text-2xl rounded-full " />
                </div>
                <div>
                  <p>08 Aug</p>
                  <p>13:38 AM</p>
                </div>
              </div>
              <div>
                <div>
                  <p>
                    <span className="text-primary-600">Others:</span>
                    Cant response sms portal down
                  </p>
                  <p>Added by Zaid khab on 08 Aug 2025 11:38 AM</p>
                </div>
              </div>
            </div>

            <div className="w-full flex gap-8 hover:bg-primary-100 py-4 px-2 text-base rounded">
              <div className=" flex gap-2 ">
                <div>
                  <TbActivity className=" bg-primary-500 text-white p-1 text-2xl rounded-full " />
                </div>
                <div>
                  <p>08 Aug</p>
                  <p>13:38 AM</p>
                </div>
              </div>
              <div>
                <div>
                  <p>
                    <span className="text-primary-600">Others:</span>
                    Cant response sms portal down
                  </p>
                  <p>Added by Zaid khab on 08 Aug 2025 11:38 AM</p>
                </div>
              </div>
            </div>
            <div className="w-full flex gap-8 hover:bg-primary-100 py-4 px-2 text-base rounded">
              <div className=" flex gap-2 ">
                <div>
                  <TbActivity className=" bg-primary-500 text-white p-1 text-2xl rounded-full " />
                </div>
                <div>
                  <p>08 Aug</p>
                  <p>13:38 AM</p>
                </div>
              </div>
              <div>
                <div>
                  <p>
                    <span className="text-primary-600">Others:</span>
                    Cant response sms portal down
                  </p>
                  <p>Added by Zaid khab on 08 Aug 2025 11:38 AM</p>
                </div>
              </div>
            </div>
            <div className="w-full flex gap-8 hover:bg-primary-100 py-4 px-2 text-base rounded">
              <div className=" flex gap-2 ">
                <div>
                  <TbActivity className=" bg-primary-500 text-white p-1 text-2xl rounded-full " />
                </div>
                <div>
                  <p>08 Aug</p>
                  <p>13:38 AM</p>
                </div>
              </div>
              <div>
                <div>
                  <p>
                    <span className="text-primary-600">Others:</span>
                    Cant response sms portal down
                  </p>
                  <p>Added by Zaid khab on 08 Aug 2025 11:38 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* End Tab content 3 */}
        </>
      ),
      // End Tab content 2
    },
    {
      label: "Task",
      content: (
        <>
          {/* Tab content 3 */}
          <AppCalendar />;{/* End Tab content 3 */}
        </>
      ),
    },
    {
      label: "Document",
      content: (
        <>
          {/* Tab content 4 */}
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 whitespace-nowrap">
            <thead className="text-xs text-[#999999] bg-white">
              <tr className="border border-tableBorder">
                <th className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack">
                  Document
                </th>
                <th className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack">
                  Type
                </th>
                <th className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack">
                  Uploaded On
                </th>
                <th className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack">
                  Status
                </th>
                <th className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack">
                  Owner
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Company Profile.pdf
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  PDF
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  2025-09-06
                </td>
                <td className="px-3 py-2 border border-tableBorder">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                    Verified
                  </span>
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Naafis
                </td>
              </tr>

              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  GST Certificate.pdf
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  PDF
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  2025-09-07
                </td>
                <td className="px-3 py-2 border border-tableBorder">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-indigo-100 text-indigo-700">
                    Under Review
                  </span>
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Aamir
                </td>
              </tr>

              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  PAN Card.png
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Image
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  2025-09-05
                </td>
                <td className="px-3 py-2 border border-tableBorder">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Sarim
                </td>
              </tr>

              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Proposal_v2.docx
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  DOCX
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  2025-09-04
                </td>
                <td className="px-3 py-2 border border-tableBorder">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-rose-100 text-rose-700">
                    Rejected
                  </span>
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Danish
                </td>
              </tr>

              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  PO_#2025-0911.pdf
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  PDF
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  2025-09-08
                </td>
                <td className="px-3 py-2 border border-tableBorder">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                    In Review
                  </span>
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Ismail
                </td>
              </tr>
            </tbody>
          </table>

          {/* End Tab content 4 */}
        </>
      ),
    },
  ];
  if (isChecking) {
    return (
      <div className="h-screen flex flex-col gap-5 justify-center items-center bg-white">
        <Image
          src="/images/orizonIcon.svg"
          alt="Loading"
          width={150}
          height={150}
          className="animate-pulse rounded"
        />
      </div>
    );
  }
const handleSubmit = async ()=>{

}
  return (
    <>
      {/* TOPT POPUP */}
      {isTotpPopupOpen && (
        <div
          //  onClick={()=>setIsTotpPopupOpen(false)}
          className="fixed inset-0 bg-black/60 z-[99] cursor-pointer flex justify-normal items-center"
        >
          <div className="mx-auto my-auto w-[90%] max-w-[500px] h-[587px] shadow-loginBoxShadow bg-white px-6 sm:px-12 py-10 sm:py-16 rounded-lg z-[999] relative">
            <IoMdClose
              onClick={() => setIsTotpPopupOpen(false)}
              className="absolute top-2 right-2 cursor-pointer text-2xl hover:bg-primary-200 "
            />
            <Image
              src="/images/orizonIcon.svg"
              alt="OrizonIcon"
              width={82}
              height={52}
              className="mx-auto mb-5"
            />
            <p className="font-bold text-lg sm:text-base leading-normal text-center text-black mb-2">
              Authenticate your Account
            </p>
            <p className="text-[#232323] text-base leading-[26px] text-center mb-10 sm:mb-14">
              Please confirm your account by entering the authentication number
              sent to your authenticator app
            </p>
            <form onSubmit={handleSubmit} className="w-full">
              <div>
                <div className="flex items-center justify-between mb-10 sm:mb-14 w-[96%] mx-auto">
                  <OtpInput
                    value={totp}
                    onChange={handleChange}
                    numInputs={6}
                    shouldAutoFocus
                    inputType="tel"
                    containerStyle={{ display: "contents" }}
                    renderInput={(props, index) => (
                      <input
                        {...props}
                        key={index}
                        className=" !w-[14%] md:!w-[55px] h-12 sm:h-14 py-3 sm:py-4 text-center sm:px-5 border-b border-[#BDD1E0] text-black text-lg sm:text-xl font-semibold leading-normal focus:outline-none focus:border-b-2 focus-within:border-primary-500"
                      />
                    )}
                  />
                </div>

                <div className="w-full">
                  <button
                    type="submit"
                    className="bg-primary-600 border rounded-[4px] w-full h-[50px] text-center text-white text-lg font-medium leading-normal mb-3 hover:bg-primary-500 active:bg-primary-700"
                    disabled={loading}
                  >
                    {loading ? "Code Verifying..." : "Verify Code"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className=" flex justify-end  min-h-screen">
        {/* Main content right section */}
        <div className="ml-[97px]  w-full md:w-[90%] m-auto bg-[#fff] min-h-[500px]  rounded p-4 mt-0 ">
          <LeftSideBar />
          {/* left section top row */}
          <DesktopHeader />
          {/* right section top row */}
          {/* </div> */}
          <div className=" w-full   bg-[#F5F7FA] flex justify-center relative">
            <div className="w-full md:w-full min-h-[600px] bg-white !rounded-3xl  shadow-lastTransaction">
              <div className="py-4 px-2 md:p-6">
                {/* Buttons */}

                <div className="flex justify-end items-center mb-6 w-full gap-2">
                  <div className="flex justify-center items-center gap-4 ">
                    <div
                      className="flex gap-2 py-3 px-0 justify-center rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group min-w-32"
                      onClick={toggleFilterFlyout}
                    >
                      <LuSquareActivity className="w-5 h-5 text-white group-hover:text-white" />
                      <p className="text-white text-base font-medium group-hover:text-white">
                        Activity
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-4">
                    <div
                      className="flex gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group min-w-32"
                      onClick={toggleFilterFlyout}
                    >
                      <FaNotesMedical className="w-5 h-5 text-white group-hover:text-white" />
                      <p className="text-white text-base font-medium group-hover:text-white">
                        Note
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-4">
                    <div
                      className="flex gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group min-w-32"
                      onClick={toggleFilterFlyout}
                    >
                      <FaTasks className="w-5 h-5 text-white group-hover:text-white" />
                      <p className="text-white text-base font-medium group-hover:text-white">
                        Task
                      </p>
                    </div>
                  </div>
                </div>
                <div className=" grid grid-cols-[30%_70%]  gap-4">
                  <div className="  w-full">
                    {/* LEAD */}
                    <div className="w-full rounded bg-primary-600 px-4 py-6 mb-6">
                      <div className=" flex text-white  gap-2 mb-5">
                        <FaStar />
                        <div>
                          <p className=" text-base font-medium leading-none">
                            Wasique Khan
                          </p>
                          <p>India</p>
                        </div>
                      </div>
                      <div className=" flex text-white items-center  gap-2 mb-3">
                        <IoIosMail />
                        <p className=" text-sm font-medium leading-none">
                          wasiquekhan802gmail.com
                        </p>
                      </div>
                      <div className=" flex text-white items-center  gap-2 mb-3">
                        <IoIosCall />
                        <p className=" text-sm font-medium leading-none">
                          9987656767
                        </p>
                      </div>
                      <div className=" flex text-white items-center  gap-2 mb-3">
                        <MdLocationPin />
                        <p className=" text-sm font-medium leading-none">
                          Indira nagar new mandala mankhurd
                        </p>
                      </div>
                    </div>
                    {/* LEAD PROPERTIES */}
                    <div className="w-full">
                      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 ">
                        <thead className="text-xs text-[#999999] bg-white">
                          <tr className="border border-tableBorder">
                            <th
                              scope="col"
                              className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack text-base"
                              colSpan={2}
                            >
                              Lead Properties
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Lead Number
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              789798
                            </td>
                          </tr>

                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Owner
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              Sajjad mapari
                            </td>
                          </tr>
                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Best time to call
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4"></td>
                          </tr>

                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Lead Source
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              Partner Referral
                            </td>
                          </tr>
                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Debt Consolidation Starus
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              PIF- Pending Document
                            </td>
                          </tr>
                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Lead Source
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              Consolidated Credit Status
                            </td>
                          </tr>
                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              WHATSAPP
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              NOT ACTIVE
                            </td>
                          </tr>
                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Account Manager
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              Zaid Khan
                            </td>
                          </tr>
                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Lead Age
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              205 Days
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className=" md:flex relative w-full">
                    <Tabs tabs={tabs} />
                    <GrPowerReset
                      onClick={() => setHitApi(!hitApi)}
                      className=" absolute -top-5 -right-1 md:top-2 md:right-1 cursor-pointer text-lg md:text-2xl text-[#4B5675] hover:text-tabHoverColor active:text-tabActiveColor"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <CustomerViewDetails
        isCustomerViewDetailOpen={isCustomerViewDetailOpen}
        setIsEditFlyoutOpen={setIsCustomerViewDetailOpen}
        customer={customer}
        selectedButton={selectedButton}
        setFaceImageFromChild={setFaceImageFromChild}
        setIdEctoFromChild={setIdEctoFromChild}
        setIdVersoFromChild={setIdVersoFromChild}
        setUserSignatureFromChild={setUserSignatureFromChild}
        setUserVideoFromChild={setUserVideoFromChild}
        hitApi={hitApi}
        setHitApi={setHitApi}
      /> */}
      {/* FITLER FLYOUT */}
      {isFlyoutFilterOpen && (
        <div
          className=" min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
          onClick={() => {
            setFlyoutFilterOpen(!isFlyoutFilterOpen);
          }}
        ></div>
      )}

      <div className={`filterflyout ${isFlyoutFilterOpen ? "filteropen" : ""}`}>
        <div className=" w-full min-h-auto">
          {/* Flyout content here */}
          <div className=" flex justify-between mb-4">
            <p className=" text-primary-600 text-[26px] font-bold leading-9">
              User Details
            </p>
            <IoCloseOutline
              onClick={toggleFilterFlyout}
              className=" h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
            />
          </div>
          <div className=" w-full border-b border-[#E7E7E7] mb-4"></div>
          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className=" w-full">
              <div className=" w-full flex gap-4 mb-4">
                <div className=" w-full">
                  <p className=" text-secondBlack font-medium text-base leading-6 mb-2">
                    First Name
                  </p>
                  <input
                    type="text"
                    //  value={filterData.name}
                    name="name"
                    //  onChange={handleChange}
                    placeholder="Alexandre"
                    className=" hover:shadow-hoverInputShadow focus-border-primary w-full  border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                  />
                </div>
              </div>

              <div className=" w-full flex flex-col md:flex-row gap-4 mb-4">
                <div className=" w-full">
                  <p className=" text-secondBlack font-medium text-base leading-6 mb-2">
                    Phone
                  </p>
                  <input
                    type="number"
                    // value={filterData.mobilephonenumber}
                    //  onChange={handleChange}
                    name="mobilephonenumber"
                    placeholder="1 (800) 667-6389"
                    className=" hover:shadow-hoverInputShadow focus-border-primary w-full  border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4"
                  />
                </div>
                <div className=" w-full">
                  <p className=" text-secondBlack font-medium text-base leading-6 mb-2">
                    Birth Date
                  </p>
                  <input
                    type="date"
                    //value={filterData.birthdate}
                    // onChange={handleChange}
                    disabled
                    name="birthdate"
                    placeholder=""
                    className="w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 cursor-not-allowed bg-[#F5F5F5] text-[#A0A0A0] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* END FORM */}

            <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center ">
              <div
                //onClick={hadleClear}
                className=" py-[13px] px-[26px] bg-primary-700 rounded-[4px] text-base font-medium leading-6  cursor-pointer w-full md:w-[49%] text-center text-white hover:bg-primary-500 hover:text-white "
              >
                Clear Data
              </div>
              <button
                type="submit"
                className=" py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full md:w-[49%] text-center hover:bg-primary-700 hover:text-white "
              >
                Filter Now
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FITLER FLYOUT END */}
    </>
  );
}
