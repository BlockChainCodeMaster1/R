import HeaderFooter from "../layout/HeaderFooter";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCards, Thumbs, EffectCreative } from "swiper/modules";
import "swiper/css";
import Link from "next/link";
import { getTotalData, getRank } from "../api";

export default function Home() {
  const [totalData, setTotalData] = useState({
    btc_amount: 0,
    users_conunt: 0,
  });
  const [rankData, setRankData] = useState([]);
  const [rankDate, setRankDate] = useState("1699718400");
  const startTime = 1699718400000;

  const formatAddress = (address: string) => {
    return (
      address.substr(0, 8) + "......" + address.substr(address.length - 8, 8)
    );
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: totalData } = await getTotalData();
      setTotalData(totalData);
      console.log("totalData", totalData);
      const { data: rankDatas } = await getRank(rankDate);
      console.log("rankData", rankDatas);
      setRankData(rankDatas.rank);
      if (1) {
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <HeaderFooter>
      <main className="text-white   bg-no-repeat bg-top_center text-center bg-[length:100%_auto] pb-20">
        <video
          className="fixed top-0 -z-20 object-cover w-full h-full opacity-70"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/ieo_background2.mp4" type="video/mp4" />
        </video>
        <div className="w-10/12 mx-auto pt-32">
          <h1 className="font-[digitalists] text-xl sm:text-2xl text-[#ff0000]">
            A System to Combat Bitcoin Ecological Entropy Increase
          </h1>
          <ul className="flex flex-row justify-center pt-5 pb-10 sm:pt-10 sm:pb-20 gap-10">
            <li>
              <h1 className="font-[digitalists] text-[#ff0000] py-2 text-sm sm:text-base">
                Total fundraising amount
              </h1>
              <p className=" text-5xl sm:text-7xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">
                {totalData.btc_amount} <span className=" text-4xl">BTC</span>
              </p>
            </li>
            <li>
              <h1 className="font-[digitalists] text-[#ff0000]  py-2 text-sm sm:text-base">
                Total fundraising amount
              </h1>
              <p className="text-5xl sm:text-7xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">
                {totalData.users_conunt}
              </p>
            </li>
          </ul>
        </div>
        <div className="sm-11/12 sm:w-8/12 mx-auto flex gap-4 sm:flex-row flex-col">
          <div className="w-10/12 mx-auto sm:w-6/12 ">
            <div className=" bg-[url('/ieo_border.png')] bg-no-repeat bg-[length:100%_100%] px-8 sm:px-12 py-8 ">
              <ul className=" sm:text-left flex gap-8 sm:flex-row flex-col  text-center">
                <li className="font-[digitalists] ">
                  <h1>Exchange ratio</h1>
                  <p className=" text-2xl pb-4">1 BTC : 30000 REVS</p>
                  <h1>My total investment</h1>
                  <p className=" text-2xl  pb-4">30000 REVS</p>
                  <h1>Number of tokens available</h1>
                  <p className=" text-2xl  pb-4">30000 REVS</p>
                </li>
                <li className=" relative w-62 h-28 mt-0 sm:mt-10 mb-10 sm:mb-0 flex justify-center sm:block ">
                    <div className="text-xs absolute top-8 sm:left-16 left-22 text-center z-30">
                        <h1>2 Btc</h1>
                        <p>(2/3000)floor</p>
                    </div>
                    <div className=" absolute -bottom-4 sm:left-20 left-26 text-xs whitespace-nowrap ">
                    3000 floor
                    </div>
                  <div className="absolute top-0 flex  overflow-hidden h-28">
                    <div className="w-28 overflow-hidden inline-block">
                      <div className=" h-56  bg-[#ff00005c] -rotate-45 transform origin-top-left"></div>
                    </div>
                    <div className="w-28  overflow-hidden inline-block">
                      <div className=" h-56  bg-[#ff00005c] rotate-45 transform origin-top-right"></div>
                    </div>
                  </div>
                  
                  <div className="overflow-hidden absolute top-0  h-1/5">
                    <div className=" flex h-28">
                        <div className="w-28 overflow-hidden inline-block">
                        <div className=" h-56  bg-[#ff0000] -rotate-45 transform origin-top-left"></div>
                        </div>
                        <div className="w-28  overflow-hidden inline-block">
                        <div className=" h-56  bg-[#ff0000] rotate-45 transform origin-top-right"></div>
                        </div>
                    </div>
                  </div>

                  {/* <div className=" absolute top-0 border-solid border-t-[#ff0000] border-t-[12rem] border-x-transparent border-x-[4rem] border-b-0"></div>
                  <div className=" absolute top-0 border-solid border-t-[#ffffff] border-t-[12rem] border-x-transparent border-x-[4rem] border-b-0"></div> */}
                </li>
              </ul>
              <p className=" relative">
                <input
                  type="text"
                  className="border border-[#FF0000] bg-transparent w-full my-4 text-base outline-none p-4"
                />
                <button className=" absolute bg-[#ff0000] cursor-pointer right-2 top-7 sm:top-6 px-6 py-2 text-xs sm:text-base">
                  MAX
                </button>
              </p>
              <p className="font-[digitalists] flex justify-between text-xs sm:text-base">
                <span>balance</span>
                <span>100.00 btc</span>
              </p>
              <p className=" pt-4 sm:pt-10">
                <button className="text-sm text-[#ff0000] border border-[#ff0000] w-full py-4 border-l-4 uppercase  bg-no-repeat bg-[length:100%_auto]">
                  fundraising
                </button>
              </p>
            </div>
            <div className=" bg-[url('/ieo_border.png')] bg-no-repeat bg-[length:100%_100%] px-8 sm:px-12 py-8 mt-4">
              <p className="font-[digitalists] flex justify-between text-base">
                <span>Number of invitees</span>
                <span>100.00 REVS</span>
              </p>
              <p className="font-[digitalists] flex justify-between pt-4 sm:pt-10 text-base">
                <span>fundraisers invited</span>
                <span>100.00 REVS</span>
              </p>
              <p className="flex gap-2 pt-4 sm:pt-10 ">
                <button className=" text-xs text-[#ff0000] border border-[#ff0000] w-1/2 py-4 border-l-4 uppercase">
                  View your invitation data
                </button>
                <button className="text-xs text-[#ff0000] border border-[#ff0000] w-1/2 py-4 border-l-4 uppercase">
                  View your own data
                </button>
              </p>
            </div>
            <div className=" bg-[url('/ieo_border.png')] bg-no-repeat bg-[length:100%_100%] px-8 sm:px-12 py-8 mt-4">
              <p className="font-[digitalists] flex justify-between text-base">
                <span>Total number of invited friends</span>
                <span>12</span>
              </p>
              <p className="font-[digitalists] flex justify-between text-base mt-4">
                <span className=" text-[#ff0000]">Invitation Link</span>
              </p>
              <p className=" relative">
                <input

                  value={`https://revs.global/?invite=`}
                  type="text"
                  className="border border-[#FF0000] bg-transparent w-full my-4 text-xs sm:text-base outline-none p-4"
                />
                <button className=" absolute bg-[#ff0000] cursor-pointer right-2 top-6 px-6 py-2 text-xs sm:text-base">
                  COPY
                </button>
              </p>
            </div>
          </div>
          <div className="w-10/12 mx-auto sm:w-6/12">
            <div className="flex gap-2 mb-4">
              <button className=" bg-[#ff0000] text-xs text-white border border-[#ff0000] w-1/2 py-4 border-l-4 uppercase">
                Invitation Fundraising Rankings
              </button>
              <button className="text-xs text-[#ff0000] border border-[#ff0000] w-1/2 py-4 border-l-4 uppercase">
                Top 10 Iuckey Rankings
              </button>
            </div>
            <div className=" bg-[url('/ieo_border.png')] bg-no-repeat bg-[length:100%_100%]  px-8 sm:px-12 py-8">
              <p className="font-[digitalists] flex justify-between pt-0 sm:pt-10 text-base">
                <span className="text-[#ff0000] text-xs sm:text-base">
                  Top 10 Invitation Fundraising Rankings
                </span>
                <span className="text-xs sm:text-base">2023/11/8</span>
              </p>
              <ul>
                {rankData.map((el, index) => (
                  <li
                    key={index}
                    className="border border-[#ff0000] p-4 my-4 flex justify-between text-left "
                  >
                    <div className="font-[digitalists] flex ">
                      {index == 0 && (
                        <img src="/no1.png" className="w-10 h-10 sm:h-auto sm:w-14 mr-2" />
                      )}
                      {index == 1 && (
                        <img src="/no2.png" className="w-10 h-10 sm:h-auto sm:w-14 mr-2" />
                      )}
                      {index == 2 && (
                        <img src="/no3.png" className="w-10 h-10 sm:h-auto sm:w-14 mr-2" />
                      )}
                      {index > 2 && (
                        <span className="text-5xl  [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500 font-[Menlo] px-2">
                          0{index}
                        </span>
                      )}
                      <div>
                        <h1 className=" text-[#ff0000] text-xs sm:text-base">
                          {formatAddress(el["invite_address"])}
                        </h1>
                        <p className="text-xs sm:text-base">Invite fundraising together</p>
                      </div>
                    </div>
                    <span className=" text-3xl sm:text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">
                      {el["amount"]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </HeaderFooter>
  );
}
