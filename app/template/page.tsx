"use client";
import Image from "next/image";
import { FormEvent, useContext, useEffect, useState } from "react";
import { CiSettings } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaGreaterThan } from "react-icons/fa6";
import { FiFilter } from "react-icons/fi";
import { HiOutlineBookOpen } from "react-icons/hi2";
import { IoCloseOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import { appCheck } from "../firebase-config";
import { getToken } from "firebase/app-check";
import AxiosProvider from "../../provider/AxiosProvider";
import StorageManager from "../../provider/StorageManager";
import LeftSideBar from "../component/LeftSideBar";
import { useRouter, useSearchParams } from "next/navigation";
import { HiChevronDoubleLeft, HiOutlineTemplate } from "react-icons/hi";
import { HiChevronDoubleRight } from "react-icons/hi";
import { number, setLocale } from "yup";
import { RiDeleteBin6Line, RiFilterFill } from "react-icons/ri";
import { toast } from "react-toastify";
import { RiAccountCircleLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Select from "react-select";
import DesktopHeader from "../component/DesktopHeader";
import { Tooltip } from "react-tooltip";
import { FaEllipsisVertical } from "react-icons/fa6";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaRegIdCard, FaUserEdit, FaUserTag } from "react-icons/fa";
import { MdDateRange, MdEdit, MdViewModule } from "react-icons/md";
import Swal from "sweetalert2";

const axiosProvider = new AxiosProvider();

type TemplateForEdit = {
  id: string;
  title: string;
  subject: string;
  body: string;
  // Optional existing file meta if you want to show it
  attachment_name?: string;
  attachment_url?: string;
};

export default function Home() {
  const checking = useAuthRedirect();
  const [isFlyoutOpen, setFlyoutOpen] = useState<boolean>(false);
  const [isFlyoutFilterOpen, setFlyoutFilterOpen] = useState<boolean>(false);
  const [data, setData] = useState<TemplateForEdit[]>([]);
  console.log("user activity dara", data);
  const [pageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [hitApi, setHitApi] = useState<boolean>(false);
  const [addFrom, setAddForm] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<boolean>(false);
  const [editObjectData, setObjectData] = useState<TemplateForEdit | null>(
    null
  );
  // console.log("OOOOOOOOOOOOOOOOOOOOOO", editObjectData);

  const closeFlyout = () => {
    setFlyoutFilterOpen(false);
    setAddForm(false);
    setEditForm(false);
  };
  const addFormFunction = () => {
    setFlyoutFilterOpen(true);
    setAddForm(true);
  };
  const editFormFunction = (item: any) => {
    setFlyoutFilterOpen(true);
    setEditForm(true);
    setObjectData(item);
  };
  const storage = new StorageManager();

  const router = useRouter();

  // Assuming `dataUserName` is an array of users

  const toggleFilterFlyout = () => setFlyoutFilterOpen(!isFlyoutFilterOpen);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await AxiosProvider.post("/gettemplate");

        // const result = response.data.data.data;
        //   console.log("888888888888888888", response.data.data);
        setData(response.data.data);
        // console.log(
        //   "888888888888888888",
        //   response.data.data.pagination.totalPages
        // );
        //  setTotalPages(response.data.data.pagination.totalPages);
        setIsError(false);
      } catch (error: any) {
        setIsError(true);
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [hitApi]); // 👈 depends on `page`

  const deleteUserData = async (id: string) => {
    const userID = id;

    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#FFCCD0",
      cancelButtonColor: "#A3000E",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await AxiosProvider.post("/deletetemplate", { id: userID });

          toast.success("Successfully Deleted");
          setHitApi(!hitApi);
          // await activityLogger.userDelete(userID);
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Failed to delete user");
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col gap-5 justify-center items-center">
        <Image
          src="/images/crmlogo.jpg"
          alt="Table image"
          width={500}
          height={500}
          style={{ width: "150px", height: "auto" }}
          className="animate-pulse rounded"
        />
      </div>
    );
  }

  if (checking) {
    return (
      <div className="h-screen flex flex-col gap-5 justify-center items-center bg-white">
        <Image
          src="/images/crmlogo.jpg"
          alt="Loading"
          width={150}
          height={150}
          className="animate-pulse rounded"
        />
      </div>
    );
  }

  return (
    <>
      <div className=" flex justify-end  min-h-screen">
        {/* Main content right section */}
        <LeftSideBar />
        <div className="ml-[97px] w-full md:w-[90%] m-auto  min-h-[500px]  rounded p-4 mt-0 ">
          {/* left section top row */}
          <DesktopHeader />
          {/* right section top row */}

          {/* Main content middle section */}
          <div className="rounded-3xl   px-1 py-6 md:p-6 relative mainContainerBg">
            {/* ----------------Table----------------------- */}
            <div className="relative overflow-x-auto  sm:rounded-lg">
              {/* Search and filter table row */}
              <div className=" flex justify-end items-center mb-6  w-full mx-auto">
                <div className=" flex justify-center items-center gap-4">
                  <div
                    className=" flex items-center gap-2 py-3 px-6 rounded-[12px] border border-[#E7E7E7] cursor-pointer bg-primary-600 group hover:bg-primary-700"
                    onClick={() => addFormFunction()}
                  >
                    <HiOutlineTemplate className=" w-4 h-4 text-white group-hover:text-white" />
                    <p className=" text-white  text-base font-medium group-hover:text-white">
                      Create Template
                    </p>
                  </div>
                </div>
              </div>
              {/* Show Applied Filters */}
              {/* <div className="w-[99%] mx-auto mb-3">
                {appliedFilters.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-2 items-center">
                    <ul className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      {appliedFilters.map((filter, index) => (
                        <li
                          key={index}
                          className="flex items-center text-black bg-primary-100 px-3 py-2 rounded-md text-xs"
                        >
                          <RiAccountCircleLine className="text-black mr-1" />
                          {filter}
                          <RxCross2
                            onClick={() => removeFilter(filter)}
                            className="text-black cursor-pointer ml-2"
                          />
                        </li>
                      ))}
                      <li
                        //  onClick={clearAllFilteredData}
                        className="flex items-center text-black bg-primary-100 px-3 py-2 rounded-md text-xs cursor-pointer"
                      >
                        Clear All
                        <RxCross2 className="text-black ml-2" />
                      </li>
                    </ul>
                  </div>
                )}
              </div> */}

              <div className="relative overflow-x-auto sm:rounded">
                {/* import { MdEdit } from "react-icons/md"; // add this at the top */}
                <table className="w-full text-sm text-left text-white whitespace-nowrap">
                  <thead className="text-xs talbleheaderBg text-white">
                    <tr>
                      <th className="px-1 py-3 md:p-3">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-white text-base leading-normal">
                            Title
                          </div>
                        </div>
                      </th>
                      <th className="px-2 py-1">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-white text-base leading-normal">
                            Action
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {!data || data.length === 0 || isError ? (
                      <tr>
                        <td colSpan={2} className="text-center py-6 text-white">
                          Data not found
                        </td>
                      </tr>
                    ) : (
                      data.map((item: any, index: number) => (
                        <tr
                          key={item?.id ?? index}
                          className="hover:bg-primary-600 border-b border-[#E7E7E7] odd:bg-[#404040]"
                        >
                          {/* Title */}
                          <td className="px-1 md:p-3 py-2">
                            <p className="text-white text-sm sm:text-base leading-normal truncate">
                              {item?.title ?? "-"}
                            </p>
                          </td>

                          {/* Action (Edit + Delete) */}
                          <td className="px-2 py-1">
                            <div className="flex gap-1 md:gap-2 justify-center md:justify-start">
                              <button
                                onClick={() => editFormFunction(item)}
                                className="py-[4px] px-3 bg-black hover:bg-primary-700 active:bg-primary-800 flex gap-1 items-center rounded-xl text-xs md:text-sm"
                                aria-label="Edit"
                                title="Edit"
                              >
                                <MdEdit className="text-white w-4 h-4" />
                              </button>

                              <button
                                onClick={() => deleteUserData(item.id)}
                                className="py-[4px] px-3 bg-black hover:bg-primary-800 active:bg-primary-700 flex gap-1 items-center rounded-full text-xs md:text-sm"
                                aria-label="Delete"
                                title="Delete"
                              >
                                <RiDeleteBin6Line className="text-white w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* ----------------End table--------------------------- */}

          {/* ------------------- */}
        </div>
      </div>

      {/* DARK BG SCREEN */}

      {/* FITLER FLYOUT */}
      {isFlyoutFilterOpen && (
        <div
          className="min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
          onClick={() => closeFlyout()}
        ></div>
      )}

      {/* NOW MY FLYOUT */}
      <div className={`filterflyout ${isFlyoutFilterOpen ? "filteropen" : ""}`}>
        {addFrom && (
          <div className="w-full min-h-auto  p-4 text-white">
            {/* Header */}
            <div className="flex justify-between mb-4 sm:mb-6 md:mb-8">
              <p className="text-primary-600 text-[22px] sm:text-[24px] md:text-[26px] font-bold leading-8 sm:leading-9">
                Create Template
              </p>
              <IoCloseOutline
                onClick={() => closeFlyout()}
                className="h-7 sm:h-8 w-7 sm:w-8 border border-gray-700 text-white rounded cursor-pointer"
              />
            </div>

            <div className="w-full border-b border-gray-700 mb-4 sm:mb-6"></div>

            <Formik
              initialValues={{
                title: "",
                subject: "",
                body: "",
                file: null as File | null,
              }}
              validationSchema={Yup.object({
                title: Yup.string().required("Title is required"),
                subject: Yup.string().required("Subject is required"),
                body: Yup.string().required("Body is required"),
                files: Yup.mixed<File>()
                  .required("File is required")
                  .test("is-file", "File is required", (v) => v instanceof File)
                  .test(
                    "file-size",
                    "File must be ≤ 10 MB",
                    (v) => !v || v.size <= 10 * 1024 * 1024
                  )
                  .test(
                    "file-type",
                    "Only JPG, PNG, PDF, DOC, DOCX allowed",
                    (v) =>
                      !v ||
                      [
                        "image/jpeg",
                        "image/png",
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      ].includes(v.type)
                  ),
              })}
              onSubmit={async (values, { resetForm, setSubmitting }) => {
                console.log("✅ Form values:", values);

                const fd = new FormData();
                fd.append("title", values.title);
                fd.append("subject", values.subject);
                fd.append("body", values.body);
                if (values.file) fd.append("file", values.file);

                try {
                  const res = await AxiosProvider.post("/createtemplate", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  toast.success("Form submitted successfully!");
                  console.log("✅ API response:", res.data);
                  closeFlyout();
                  setHitApi(!hitApi);
                  resetForm();
                } catch (error: any) {
                  console.error("❌ Submit error:", error);
                  toast.error("Failed to submit the form.");
                } finally {
                  setSubmitting(false); // <-- keeps the button disabled until API completes
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                setFieldValue,
                handleSubmit,
                isSubmitting,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <div className="w-full space-y-5">
                    {/* Title */}
                    <div className="w-full">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Title
                      </p>
                      <input
                        type="text"
                        name="title"
                        value={values.title}
                        onChange={handleChange}
                        placeholder="Enter title"
                        className="hover:shadow-hoverInputShadow focus:border-primary-600 w-full h-[50px] border border-gray-700 rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black"
                      />
                      {touched.title && errors.title && (
                        <div className="text-red-500 text-sm">
                          {errors.title}
                        </div>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="w-full">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Subject
                      </p>
                      <input
                        type="text"
                        name="subject"
                        value={values.subject}
                        onChange={handleChange}
                        placeholder="Enter subject"
                        className="hover:shadow-hoverInputShadow focus:border-primary-600 w-full h-[50px] border border-gray-700 rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black"
                      />
                      {touched.subject && errors.subject && (
                        <div className="text-red-500 text-sm">
                          {errors.subject}
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="w-full">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Body
                      </p>
                      <input
                        type="text"
                        name="body"
                        value={values.body}
                        onChange={handleChange}
                        placeholder="Enter body"
                        className="hover:shadow-hoverInputShadow focus:border-primary-600 w-full h-[50px] border border-gray-700 rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black"
                      />
                      {touched.body && errors.body && (
                        <div className="text-red-500 text-sm">
                          {errors.body}
                        </div>
                      )}
                    </div>

                    {/* File */}
                    <div className="w-full">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        File (Image, PDF, DOC, etc.)
                      </p>
                      <input
                        type="file"
                        name="file"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const f = e.currentTarget.files?.[0] || null;
                          setFieldValue("file", f);
                        }}
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        className="hover:shadow-hoverInputShadow focus:border-primary-600 w-full h-[50px] border border-gray-700 rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black file:mr-4 file:py-2 file:px-4 file:rounded-[4px] file:border-0 file:text-sm file:font-semibold file:bg-primary-700 file:text-white hover:file:bg-primary-800 pt-[6px]"
                      />
                      {touched.file && typeof errors.file === "string" && (
                        <div className="text-red-500 text-sm text-center mt-1">
                          {errors.file}
                        </div>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`py-[13px] px-[26px] w-full  rounded-[4px] text-base font-medium leading-6 text-white text-center
    ${
      isSubmitting
        ? "bg-primary-700 opacity-60 cursor-not-allowed"
        : "bg-primary-700 hover:bg-primary-800"
    }`}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
        {editForm && (
          <div className="w-full min-h-auto  p-4 text-white">
            {/* Header */}
            <div className="flex justify-between mb-4 sm:mb-6 md:mb-8">
              <p className="text-primary-600 text-[22px] sm:text-[24px] md:text-[26px] font-bold leading-8 sm:leading-9">
                Edit Template
              </p>
              <IoCloseOutline
                onClick={() => closeFlyout()}
                className="h-7 sm:h-8 w-7 sm:w-8 border border-gray-700 text-white rounded cursor-pointer"
              />
            </div>

            <div className="w-full border-b border-gray-700 mb-4 sm:mb-6"></div>

            <Formik
              enableReinitialize
              initialValues={{
                id: editObjectData?.id ?? "",
                title: editObjectData?.title ?? "",
                subject: editObjectData?.subject ?? "",
                body: editObjectData?.body ?? "",
                file: null as File | null,
              }}
              validationSchema={Yup.object({
                id: Yup.string().required("Template ID is required"),
                title: Yup.string().required("Title is required"),
                subject: Yup.string().required("Subject is required"),
                body: Yup.string().required("Body is required"),
                // file is OPTIONAL on update; validate only if provided
                file: Yup.mixed<File | null>()
                  .nullable()
                  .test(
                    "file-size",
                    "File must be ≤ 10 MB",
                    (v) => !v || v.size <= 10 * 1024 * 1024
                  )
                  .test(
                    "file-type",
                    "Only JPG, PNG, PDF, DOC, DOCX allowed",
                    (v) =>
                      !v ||
                      [
                        "image/jpeg",
                        "image/png",
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      ].includes(v.type)
                  ),
              })}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                const fd = new FormData();
                // required id
                fd.append("id", values.id);
                fd.append("title", values.title);
                fd.append("subject", values.subject);
                fd.append("body", values.body);
                // append file ONLY if user picked one
                if (values.file) fd.append("file", values.file);

                try {
                  // Use your update endpoint; keeping POST + multipart since file may be present.
                  // If your API expects PUT /templates/:id, you can switch to that.
                  const res = await AxiosProvider.post("/updatetemplate", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  toast.success("Template updated successfully!");
                  console.log("✅ Update response:", res.data);
                  closeFlyout();
                  setHitApi(!hitApi);
                  resetForm();
                } catch (err) {
                  console.error("❌ Update error:", err);
                  toast.error("Failed to update the template.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                setFieldValue,
                handleSubmit,
                isSubmitting,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <div className="w-full space-y-5">
                    {/* (Hidden) ID field to keep Formik state obvious (can also be read-only text) */}
                    <input type="hidden" name="id" value={values.id} readOnly />

                    {/* Title */}
                    <div className="w-full">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Title
                      </p>
                      <input
                        type="text"
                        name="title"
                        value={values.title}
                        onChange={handleChange}
                        placeholder="Enter title"
                        className="hover:shadow-hoverInputShadow focus:border-primary-600 w-full h-[50px] border border-gray-700 rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black"
                      />
                      {touched.title && errors.title && (
                        <div className="text-red-500 text-sm">
                          {errors.title}
                        </div>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="w-full">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Subject
                      </p>
                      <input
                        type="text"
                        name="subject"
                        value={values.subject}
                        onChange={handleChange}
                        placeholder="Enter subject"
                        className="hover:shadow-hoverInputShadow focus:border-primary-600 w-full h-[50px] border border-gray-700 rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black"
                      />
                      {touched.subject && errors.subject && (
                        <div className="text-red-500 text-sm">
                          {errors.subject}
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="w-full">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Body
                      </p>
                      <input
                        type="text"
                        name="body"
                        value={values.body}
                        onChange={handleChange}
                        placeholder="Enter body"
                        className="hover:shadow-hoverInputShadow focus:border-primary-600 w-full h-[50px] border border-gray-700 rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black"
                      />
                      {touched.body && errors.body && (
                        <div className="text-red-500 text-sm">
                          {errors.body}
                        </div>
                      )}
                    </div>

                    {/* Optional: show existing attachment (if you have it on the object) */}
                    {editObjectData?.attachment_name && (
                      <div className="text-sm text-gray-300">
                        Current file:{" "}
                        <span className="font-medium">
                          {editObjectData.attachment_name}
                        </span>
                        {/* If you have a proper absolute URL, you can render a link */}
                        {/* <a href={editObjectData.attachment_url} target="_blank" className="text-primary-400 underline ml-2">View</a> */}
                      </div>
                    )}

                    {/* File (optional on update) */}
                    <div className="w-full">
                      <p className="text-white font-medium text-base leading-6 mb-2">
                        Replace File (optional)
                      </p>
                      <input
                        type="file"
                        name="file"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const f = e.currentTarget.files?.[0] || null;
                          setFieldValue("file", f);
                        }}
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        className="hover:shadow-hoverInputShadow focus:border-primary-600 w-full h-[50px] border border-gray-700 rounded-[4px] text-white placeholder-gray-400 pl-4 mb-2 bg-black file:mr-4 file:py-2 file:px-4 file:rounded-[4px] file:border-0 file:text-sm file:font-semibold file:bg-primary-700 file:text-white hover:file:bg-primary-800 pt-[6px]"
                      />
                      {touched.file && typeof errors.file === "string" && (
                        <div className="text-red-500 text-sm text-center mt-1">
                          {errors.file}
                        </div>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`py-[13px] px-[26px] w-full rounded-[4px] text-base font-medium leading-6 text-white text-center
                ${
                  isSubmitting
                    ? "bg-primary-700 opacity-60 cursor-not-allowed"
                    : "bg-primary-700 hover:bg-primary-800"
                }`}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? "Updating..." : "Update Template"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>

      {/* FITLER FLYOUT END */}
    </>
  );
}
