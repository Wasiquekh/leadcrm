"use client";
import Image from "next/image";
import Tabs from "../../component/Tabs";
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AxiosProvider from "../../../provider/AxiosProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-phone-input-2/lib/style.css";
import LeftSideBar from "../../component/LeftSideBar";
import DesktopHeader from "../../component/DesktopHeader";
import { useAuthRedirect } from "../../component/hooks/useAuthRedirect";

const axiosProvider = new AxiosProvider();

// Define types
interface FormValues {
  username: string;
  password: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  price_usdollar: string;
  product_image: string;
  contact: string;
  product_category: string;
  product_category_name: string;
  product_category_id: string;
}

// Yup Validation Schema
const validationSchema = Yup.object().shape({
  username: Yup.string()
    .email("Enter a valid email address")
    .required("Username is required"),
  password: Yup.string().required("Password is required"),
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .positive("Price must be positive")
    .required("Price is required"),
  currency: Yup.string().required("Currency is required"),
  price_usdollar: Yup.number()
    .typeError("Price (USD) must be a number")
    .required("Price (USD) is required"),
  product_image: Yup.string().required("Product Image is required"),
  contact: Yup.string().required("Contact is required"),
  product_category: Yup.string().required("Product Category is required"),
  product_category_name: Yup.string().required("Category Name is required"),
  product_category_id: Yup.string().required("Category ID is required"),
});

const initialValues: FormValues = {
  username: "",
  password: "",
  name: "",
  description: "",
  price: "",
  currency: "",
  price_usdollar: "",
  product_image: "",
  contact: "",
  product_category: "",
  product_category_name: "",
  product_category_id: "",
};

export default function Home() {
  const isChecking = useAuthRedirect();
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
  // Submit handler
  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const res = await axiosProvider.post("/createproduct", values);
      console.log("API Response:", res.data);
      toast.success("Form submitted successfully!");
      resetForm();
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to submit the form.");
    }
  };

  const tabs = [
    {
      label: "Create Product",
      content: (
        <>
          <div className="flex gap-8 pt-3 flex-col md:flex-row">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="w-full md:w-9/12">
                  {/* Row 1 */}
                  <div className="w-full flex flex-col md:flex-row gap-6">
                    {/* Username */}
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Username
                      </p>
                      <Field
                        type="email"
                        name="username"
                        placeholder="Enter email"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] 
               rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="username"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>

                    {/* Password */}
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Password
                      </p>
                      <Field
                        type="text"
                        name="password"
                        placeholder="Enter password"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="w-full flex flex-col md:flex-row gap-6">
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Name
                      </p>
                      <Field
                        type="text"
                        name="name"
                        placeholder="Enter name"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Description
                      </p>
                      <Field
                        type="text"
                        name="description"
                        placeholder="Enter description"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="w-full flex flex-col md:flex-row gap-6">
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Price
                      </p>
                      <Field
                        type="number"
                        name="price"
                        placeholder="Enter price"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="price"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>

                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Currency
                      </p>
                      <Field
                        type="text"
                        name="currency"
                        placeholder="Enter currency"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="currency"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="w-full flex flex-col md:flex-row gap-6">
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Price (USD)
                      </p>
                      <Field
                        type="number"
                        name="price_usdollar"
                        placeholder="Enter price in USD"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="price_usdollar"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Product Image
                      </p>
                      <Field
                        type="text"
                        name="product_image"
                        placeholder="Enter image URL"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="product_image"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>
                  </div>

                  {/* Row 5 */}
                  <div className="w-full flex flex-col md:flex-row gap-6">
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Contact
                      </p>
                      <Field
                        type="text"
                        name="contact"
                        placeholder="Enter contact info"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="contact"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Product Category
                      </p>
                      <Field
                        type="text"
                        name="product_category"
                        placeholder="Enter product category"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="product_category"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>
                  </div>

                  {/* Row 6 */}
                  <div className="w-full flex flex-col md:flex-row gap-6">
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Category Name
                      </p>
                      <Field
                        type="text"
                        name="product_category_name"
                        placeholder="Enter category name"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="product_category_name"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Category ID
                      </p>
                      <Field
                        type="text"
                        name="product_category_id"
                        placeholder="Enter category ID"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="product_category_id"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="w-full mt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-[50px] bg-primary-600 rounded-[4px] text-white text-lg leading-normal font-medium hover:bg-primary-600 hover:text-white"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </>
      ),
    },
  ];
  return (
    <>
      <div className=" flex justify-end  min-h-screen">
        {/* Left sidebar */}
        <LeftSideBar />
        {/* Main content right section */}
        <div className="w-full md:w-[83%]  min-h-[500px]  rounded p-4  bg-[#F5F7FA] relative">
          <div className="absolute bottom-0 right-0">
            <Image
              src="/images/sideDesign.svg"
              alt="side desgin"
              width={100}
              height={100}
              className=" w-full h-full"
            />
          </div>
          {/* right section top row */}
          {/* <div className=" w-full flex justify-end items-center gap-7 mb-3 p-4 "> */}
          <DesktopHeader />
          {/* </div> */}
          <div className=" w-full   bg-[#F5F7FA] flex justify-center relative ">
            <div className=" w-full min-h-[600px] bg-white rounded-[25px]">
              <div className="p-2 md:p-6">
                <Tabs tabs={tabs} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
