import HeaderFooter from "../layout/HeaderFooter";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCards, Thumbs, EffectCreative } from "swiper/modules";
import "swiper/css";
import Link from "next/link";

export default function Home() {
  return (
    <HeaderFooter>
      <main className="text-white">
        <div className=" relative pt-20">
          <div className=" sm:w-8/12 w-11/12 mx-auto pt-36 pb-0">
            <h1 className=" pl-24">
              <img src="/slogan.png" className=" sm:w-8/12 w-12/12" />
            </h1>
            <h2 className="font-[digitalists] text-[#FF0000] text-xl ml-0 sm:ml-44 mt-1 sm:text-left text-center">
              A System to Combat Bitcoin Ecological Entropy Increase
            </h2>
            <p className=" border-l-4 border-[#FF0000] pl-4 ml-0 sm:ml-[18rem] mt-8 text-xs w-12/12 sm:w-8/12 relative leading-4">
              <i className=" w-60 h-8 bg-[url('/slogan_tips.png')] bg-no-repeat bg-right-top bg-[length:100%_auto] absolute sm:-right-24 right-0 -top-8"></i>
              REVSis obbrevuation for &apos;Revolution&apos; and
              &apos;Satoshis,&apos; It is utilising &apos;sats,&apos; the
              smallest unit, as entropy factors, REVS introduces a resonance
              mechanism to catalyze entropic fusion. This innovative approach
              combats the escalating disarray within the Bitcoin ecosystem,
              striving for a more ordered and stable digital currency
              environment.
            </p>
            <p className=" text-center py-4">
              <Link href="/launch">
                <button className="cursor-pointer bg-[#FF0000]  my-4 px-14 py-3 text-xs sm:text-base hover:drop-shadow-[0_5px_5px_rgba(255,0,0,0.75)]">
                  Launch
                </button>
              </Link>
            </p>
          </div>
          <div className="bg-[url('/slogan_cover.png')] bg-no-repeat absolute top-0 left-0 right-0 bottom-0 bg-top bg-[length:80%_auto] -z-10 animate-pulse"></div>
          <div className="bg-[url('/video_cover.png')] bg-no-repeat absolute h-10 left-0 right-0 bottom-0 bg-top bg-[length:80%_auto] -z-10"></div>

          <video
            className="absolute top-0 -z-20 object-cover w-full h-full "
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/bg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className=" bg-[url('/main_bg.png')] bg-no-repeat bg-[length:auto_100%] bg-center">
          <div className=" sm:w-8/12 w-11/12 mx-auto bg-[url('/project_vison_bg.png')] bg-no-repeat bg-center bg-cover py-2 sm:py-32 flex gap-12 flex-col sm:flex-row">
            <div className=" sm:w-5/12 w-12/12">
              <h1>
                <img src="/project_vision.png" className="w-8/12" />
              </h1>
              <p className=" text-xs ml-4 mt-8 leading-4">
                REVS&apos;s target is through the mechanism of entropic fusion,
                that&apos;s to enhance orderliness within the system, reducing
                the propensity towards chaos. This initiative is set to propel
                the cryptocurrency market towards greater stability and fairness
              </p>
            </div>
            <div className=" w-12/12 sm:w-7/12 px-4 sm:px-8 h-60 sm:h-80">
              <div className="bg-[url('/video_border.png')] bg-no-repeat bg-[length:100%_100%] p-2 pl-4 pb-4 w-full h-full relative z-10">
                <video
                  className="-z-20 object-cover w-full h-full "
                  playsInline
                  controls
                  poster="/cover.png"
                >
                  <source src="/r.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
          <div className=" bg-[#ff0000]">
            <div className=" w-12/12 sm:w-8/12 mx-auto flex relative sm:py-8 pt-14 pb-4 sm:pb-4 justify-start sm:justify-end flex-row  overflow-hidden  sm:overflow-visible  pl-4">
              <img
                src="/mode.png"
                className="w-8/12 sm:w-[30%] absolute -right-20 sm:left-0 top-20 sm:top-auto sm:bottom-0 animate-[bounce_5s_linear_infinite]"
              />
              <div className="w-9/12 sm:w-8/12 sm:relative z-10">
                <h1 className="font-[digitalists] text-base sm:text-3xl whitespace-nowrap">
                  REVS Resonance V Pool Mechanism Introduction
                </h1>
                <p className=" text-xs py-6 leading-5">
                  A. The Resonance V pool is an inverted triangle with 3,000
                  layers, consisting of an unlimited number of layers with
                  different ratios.
                  <br />
                  B. Each layer in the pool has a base exchange capacity of
                  2BTC.
                  <br />
                  C. The bottom layer of the inverted triangle is the first
                  layer of the Resonance V pool, and the exchange ratio of this
                  layer is 1:10.
                  <br />
                  D. Depending on the number of tokens in the Resonance V pool
                  and the BTC exchange limit, the ratio of BTC to tokens will
                  increase by 10 units for each higher layer. increases by 10
                  units{" "}
                </p>
              </div>
            </div>
          </div>
          <div className=" bg-[url('/tokenomics_bg.png')] bg-no-repeat bg-center bg-cover py-10 sm:pt-20 sm:pb-40 pb-32 sm:w-11/12 mx-auto">
            <h1>
              <img
                src="/token_title.png"
                className=" w-10/12 sm:w-4/12 mx-auto"
              />
            </h1>
            <p className=" text-center font-[digitalists] text-base sm:text-2xl text-[#ff0000] py-4 sm:pt-2 sm:pb-12">
              REVS - 210000000 pieces
            </p>
            <img src="/tokenomics.png" className=" w-12/12 sm:w-8/12 mx-auto" />
          </div>
        </div>
      </main>
    </HeaderFooter>
  );
}
