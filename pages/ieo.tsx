import HeaderFooter from "../layout/HeaderFooter";
import {useState,useEffect, useRef} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCards, Thumbs, EffectCreative } from "swiper/modules";
import "swiper/css";
import Link from "next/link";

export default function Home() {

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
            <h1 className="font-[digitalists] text-2xl text-[#ff0000]">A System to Combat Bitcoin Ecological Entropy Increase</h1>
            <ul className="flex flex-row justify-center py-20 gap-10">
                <li>
                    <h1 className="font-[digitalists] text-[#ff0000] py-2">Total fundraising amount</h1>
                    <p className=" text-7xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">$13,000.00</p>
                </li>
                <li>
                    <h1 className="font-[digitalists] text-[#ff0000]  py-2">Total fundraising amount</h1>
                    <p className=" text-7xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">$13,000.00</p>
                </li>
            </ul>
        </div>
        <div className="w-8/12 mx-auto flex gap-4">
            <div className="w-6/12">
                <div className=" bg-[url('/ieo_border.png')] bg-no-repeat bg-[length:100%_100%] px-12 py-8">
                    <h1 className="font-[digitalists] text-[#ff0000] py-4">Total fundraising amount</h1>
                    <p className=" text-6xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">$13,000.00</p>
                    <p className="font-[digitalists] flex justify-between pt-10 text-base">
                        <span>tokens available</span>
                        <span>100.00 REVS</span>
                    </p>
                    <div className="border border-[#ff0000] py-4 my-10  text-base">
                        <h1 className="font-[digitalists] py-4">The total tokens that the inviter can receive</h1>
                        <p className=" text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">100.00 REVS</p>
                    </div>
                </div>
                <div className=" bg-[url('/ieo_border.png')] bg-no-repeat bg-[length:100%_100%] px-12 py-8 mt-4">
                    <p className="font-[digitalists] flex justify-between pt-10 text-base">
                        <span>Wallet balance</span>
                        <span>100.00 REVS</span>
                    </p>
                    <p className="font-[digitalists] flex justify-between pt-10 text-base">
                        <span>Number of tokens available</span>
                        <span>100.00 REVS</span>
                    </p>
                    <p className=" relative">
                        <input type="text" className="border border-[#FF0000] bg-transparent w-full my-4 text-base outline-none p-4"/>
                        <button className=" absolute bg-[#ff0000] cursor-pointer right-2 top-6 px-6 py-2">MAX</button>
                    </p>
                    <p>
                        <button className="text-sm text-[#ff0000] border border-[#ff0000] w-full py-4 border-l-4 uppercase  bg-no-repeat bg-[length:100%_auto]">fundraising</button>
                    </p>
                </div>
                <div className=" bg-[url('/ieo_border.png')] bg-no-repeat bg-[length:100%_100%] px-12 py-8 mt-4">
                    <p className="flex gap-2">
                        <button className=" text-xs text-[#ff0000] border border-[#ff0000] w-1/2 py-4 border-l-4 uppercase">View your invitation data</button>
                        <button className="text-xs text-[#ff0000] border border-[#ff0000] w-1/2 py-4 border-l-4 uppercase">View your own data</button>
                    </p>
                    <p className="font-[digitalists] flex justify-between pt-10 text-base">
                        <span>Number of invitees</span>
                        <span>100.00 REVS</span>
                    </p>
                    <p className="font-[digitalists] flex justify-between pt-10 text-base">
                        <span>fundraisers invited</span>
                        <span>100.00 REVS</span>
                    </p>
                </div>
            </div>
            <div className="w-6/12">
                <div className="flex gap-2 mb-4">
                    <button className=" bg-[#ff0000] text-xs text-white border border-[#ff0000] w-1/2 py-4 border-l-4 uppercase">Invitation Fundraising Rankings</button>
                    <button className="text-xs text-[#ff0000] border border-[#ff0000] w-1/2 py-4 border-l-4 uppercase">Top 10 Iuckey Rankings</button>
                </div>
                <div className=" bg-[url('/ieo_border.png')] bg-no-repeat bg-[length:100%_100%] px-12 py-8">
                    <p className="font-[digitalists] flex justify-between pt-10 text-base">
                        <span className="text-[#ff0000]">Top 10 Invitation Fundraising Rankings</span>
                        <span>2023/11/8</span>
                    </p>
                    <ul>
                        <li className="border border-[#ff0000] p-4 my-4 flex justify-between text-left ">
                            <div className="font-[digitalists] flex ">
                                <img src="/no1.png" className="w-14 mr-2" />
                                <div>
                                    <h1 className=" text-[#ff0000]">0xc1459...3114</h1>
                                    <p>Invite fundraising together</p>
                                </div>
                            </div>
                            <span className="text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">
                                100.00 
                            </span>
                        </li>
                        <li className="border border-[#ff0000] p-4 my-4 flex justify-between text-left ">
                            <div className="font-[digitalists] flex ">
                                <img src="/no2.png" className="w-14 mr-2" />
                                <div>
                                    <h1 className=" text-[#ff0000]">0xc1459...3114</h1>
                                    <p>Invite fundraising together</p>
                                </div>
                            </div>
                            <span className="text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">
                                100.00 
                            </span>
                        </li>
                        <li className="border border-[#ff0000] p-4 my-4 flex justify-between text-left ">
                            <div className="font-[digitalists] flex ">
                                <img src="/no3.png" className="w-14 mr-2" />
                                <div>
                                    <h1 className=" text-[#ff0000]">0xc1459...3114</h1>
                                    <p>Invite fundraising together</p>
                                </div>
                            </div>
                            <span className="text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">
                                100.00 
                            </span>
                        </li>
                        <li className="border border-[#ff0000] p-4 my-4 flex justify-between text-left ">
                            <div className="font-[digitalists] flex ">
                                <span className="text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500 font-[Menlo] px-2">04</span>
                                <div>
                                    <h1 className=" text-[#ff0000]">0xc1459...3114</h1>
                                    <p>Invite fundraising together</p>
                                </div>
                            </div>
                            <span className="text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">
                                100.00 
                            </span>
                        </li>
                        <li className="border border-[#ff0000] p-4 my-4 flex justify-between text-left ">
                            <div className="font-[digitalists] flex ">
                                <span className="text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500 font-[Menlo] px-2">04</span>
                                <div>
                                    <h1 className=" text-[#ff0000]">0xc1459...3114</h1>
                                    <p>Invite fundraising together</p>
                                </div>
                            </div>
                            <span className="text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">
                                100.00 
                            </span>
                        </li>
                        <li className="border border-[#ff0000] p-4 my-4 flex justify-between text-left ">
                            <div className="font-[digitalists] flex ">
                                <span className="text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500 font-[Menlo] px-2">04</span>
                                <div>
                                    <h1 className=" text-[#ff0000]">0xc1459...3114</h1>
                                    <p>Invite fundraising together</p>
                                </div>
                            </div>
                            <span className="text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">
                                100.00 
                            </span>
                        </li>
                        <li className="border border-[#ff0000] p-4 my-4 flex justify-between text-left ">
                            <div className="font-[digitalists] flex ">
                                <span className="text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500 font-[Menlo] px-2">04</span>
                                <div>
                                    <h1 className=" text-[#ff0000]">0xc1459...3114</h1>
                                    <p>Invite fundraising together</p>
                                </div>
                            </div>
                            <span className="text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">
                                100.00 
                            </span>
                        </li>
                        <li className="border border-[#ff0000] p-4 my-4 flex justify-between text-left ">
                            <div className="font-[digitalists] flex ">
                                <span className="text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500 font-[Menlo] px-2">04</span>
                                <div>
                                    <h1 className=" text-[#ff0000]">0xc1459...3114</h1>
                                    <p>Invite fundraising together</p>
                                </div>
                            </div>
                            <span className="text-5xl font-[Bayon] [text-shadow:1px_3px_5px_var(--tw-shadow-color)] shadow-red-500">
                                100.00 
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </main>
    </HeaderFooter>
  );
}
