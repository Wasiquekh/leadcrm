"use client";
import Image from "next/image";
import Tabs from "../component/Tabs";
import { CiSettings } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import { PiArrowCircleUp } from "react-icons/pi";
import LeftSideBar from "../component/LeftSideBar";
import AxiosProvider from "../../provider/AxiosProvider";
import { useEffect, useState } from "react";
import { HiChevronDoubleLeft } from "react-icons/hi";
import { HiChevronDoubleRight } from "react-icons/hi";
import DesktopHeader from "../component/DesktopHeader";
import { Tooltip } from "react-tooltip";
import { FaEllipsisVertical } from "react-icons/fa6";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";

const axiosProvider = new AxiosProvider();

interface Tab {
  label: string;
  content: JSX.Element;
}
interface Transaction {
  id: string;
  orizon_transaction_id: string;
  from_account_no: string;
  to_account_no: string;
  amount: string; // kept as string since input is string (e.g., "1.00")
  currency: string;
  status: "FAILED" | "SUCCESS" | "PENDING"; // extend as needed
  deposit_fineract_txn_id: string | null;
  withdrawal_fineract_txn_id: string | null;
  deposit_savings_id: string;
  withdrawal_savings_id: string;
  extra: {
    error: string;
    initAt: string; // ISO timestamp
    failedAt: string; // ISO timestamp
  };
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export default function Home() {
  const isChecking = useAuthRedirect();
  const [data, setData] = useState<Transaction[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const fetchData = async () => {
    setIsLoading(true);
    // setIsFilter(false);
    try {
      const response = await axiosProvider.get(
        `/getalltransactionmobile?page=${page}&limit=${limit}`
      );
      // console.log('transactoin data',response.data.data.transactions);
      setTotalPages(response.data.data.totalPages);
      const result = response.data.data.result;
      setData(result);
    } catch (error: any) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [page]);
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
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
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col gap-5 justify-center items-center">
        <Image
          src="/images/orizonIcon.svg"
          alt="Table image"
          width={500}
          height={500}
          style={{ width: "150px", height: "auto" }}
          className="animate-pulse rounded"
        />
      </div>
    );
  }
  const tabs: Tab[] = [
    {
      label: "All Transactions",
      content: (
        <>
          {/* ----------------Table----------------------- */}
          <div className="relative overflow-x-auto  sm:rounded-[12px]">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-[#999999] capitalize">
                <tr className="border border-tableBorder">
                  <th
                    scope="col"
                    className="p-2 py-0 border border-tableBorder"
                  >
                    <div className="flex items-center gap-2 p-3">
                      <div className="font-medium text-firstBlack text-base leading-normal">
                        orizon transaction id
                      </div>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-0 border border-tableBorder hidden md:table-cell"
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-firstBlack text-base leading-normal">
                        from account no
                      </div>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-0 border border-tableBorder hidden md:table-cell"
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-firstBlack text-base leading-normal">
                        to account no
                      </div>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-0 border border-tableBorder hidden md:table-cell"
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-firstBlack text-base leading-normal">
                        amount
                      </div>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-0 border border-tableBorder hidden md:table-cell"
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-firstBlack text-base leading-normal">
                        currency
                      </div>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-0 border border-tableBorder hidden md:table-cell"
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-firstBlack text-base leading-normal">
                        status
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isError ? (
                  <tr>
                    <td colSpan={6} className="text-center text-xl mt-5">
                      <div className="mt-5">Data not found</div>
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr
                      className="border border-tableBorder bg-white hover:bg-primary-100"
                      key={index}
                    >
                      {/* Transaction ID */}
                      <td className="p-3">
                        <p className="text-[#232323] text-base leading-normal">
                          {item.orizon_transaction_id}
                        </p>
                      </td>

                      {/* From Account */}
                      <td className="p-3 border border-tableBorder">
                        <p className="text-[#232323] text-base leading-normal">
                          {item.from_account_no}
                        </p>
                      </td>

                      {/* To Account */}
                      <td className="p-3 border border-tableBorder">
                        <p className="text-[#232323] text-base leading-normal">
                          {item.to_account_no}
                        </p>
                      </td>

                      {/* Amount*/}
                      <td className="p-3 border border-tableBorder">
                        <p className="text-[#232323] text-base leading-normal">
                          {item.amount}
                        </p>
                      </td>
                      {/* curreny */}
                      <td className="p-3 border border-tableBorder">
                        <p className="text-[#232323] text-base leading-normal">
                          {item.currency}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-3 border border-tableBorder">
                        <p
                          className={` font-semibold px-2 py-1  text-white text-xs sm:text-sm flex justify-center items-center p-1 rounded-[4px] ${
                            item.status === "FAILED"
                              ? "bg-[#FE0000] "
                              : " bg-primary-600"
                          }`}
                        >
                          {item.status}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ----------------End table--------------------------- */}
        </>
      ),
    },
  ];

  return (
    <div className=" flex justify-end  min-h-screen">
      {/* Left sidebar */}
      <LeftSideBar />
      {/* Main content right section */}
      <div className="w-full md:w-[83%] bg-[#F5F7FA] min-h-[500px] rounded p-4 mt-0 relative">
        <div className="absolute bottom-0 right-0">
          <Image
            src="/images/sideDesign.svg"
            alt="side desgin"
            width={100}
            height={100}
            className=" w-full h-full"
          />
        </div>
        {/* Right section top row */}
        {/* <div className="w-full flex justify-end items-center  p-4"> */}
        <DesktopHeader />
        {/* </div> */}
        <div className="w-full bg-[#F5F7FA] flex justify-center p-0 md:p-0">
          <div className="w-full min-h-[600px] bg-white rounded-3xl shadow-lastTransaction z-10">
            <div className="p-1 md:p-6">
              <Tabs tabs={tabs} />
            </div>
          </div>
        </div>
        {/* PAGINATION */}
        <div className="flex justify-center items-center my-10 relative">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-2 py-2 mx-2 border rounded bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiChevronDoubleLeft className=" w-6 h-auto" />
          </button>
          <span className="text-[#717171] text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-2 py-2 mx-2 border rounded bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiChevronDoubleRight className=" w-6 h-auto" />
          </button>
        </div>
        {/* END PAGINATION */}
      </div>
    </div>
  );
}
