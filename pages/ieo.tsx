import HeaderFooter from "../layout/HeaderFooter";
import {useState} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCards, Thumbs, EffectCreative } from "swiper/modules";
import "swiper/css";
import Link from "next/link";

export default function Home() {
 
  return (
    <HeaderFooter>
      <main className="text-white  bg-[url('/ieo_bg.png')] bg-no-repeat bg-center text-center bg-[length:100%_auto]">
        <div className="w-10/12 mx-auto pt-32">
            <h1 className="font-[digitalists] text-2xl text-[#ff0000]">A System to Combat Bitcoin Ecological Entropy Increase</h1>
            <ul className="flex flex-row justify-center py-20 gap-10">
                <li>
                    <h1 className="font-[digitalists] text-[#ff0000]">Total fundraising amount</h1>
                    <p className=" text-6xl">$13,000.00</p>
                </li>
                <li>
                    <h1 className="font-[digitalists] text-[#ff0000]">Total number of fundraisers</h1>
                    <p>$13,000.00</p>
                </li>
            </ul>
        </div>
      </main>
    </HeaderFooter>
  );
}
