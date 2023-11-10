import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [showNav, setShowNav] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [leftNav, setLeftNav] = useState([
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Raise",
      href: "/#data",
    }
  ]);

  const [rightNav, setRightNav] = useState([
    {
      name: "Ieo",
      href: "/#IEO",
    },
    {
      name: "Docs",
      href: "/#IEO",
    }
  ]);

  useEffect(() => {
    console.log("useEffect");
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      setShowNav(false);
    } else {
      setShowNav(true);
    }
  }, []);

  const connectUnisatWallet = async () => {
    if (typeof (window as any).unisat == 'undefined') {
      alert('UniSat Wallet is not installed!');
    }else{
      try {
        let accounts = await (window as any).unisat.requestAccounts();
        alert('connect success')
        console.log(accounts);
      } catch (e) {
        alert('connect failed');
      }
    }
  }

  const connectOKXWallet = async () => {
    if (typeof (window as any).okxwallet == 'undefined') {
      alert('OKX Wallet is not installed!');
    }else{
      try {
        let accounts = await (window as any).okxwallet.bitcoin.connect()
        alert('connect success');
        console.log(accounts);
      } catch (e) {
        console.log(e);
        alert('connect failed');
      }
    }
  }

  return (
    <>
    {isMobile && (
        <div
          className=" bg-[#02000b] bg-opacity-30  fixed left-0 right-0 top-0 bottom-0 z-40"
          onClick={() => {
            setShowNav(false);
            setIsMobile(false);
          }}
        ></div>
      )}
      {showNav && (
        <ul
          className=" justify-start sm:justify-center items-center gap-4 text-basic bg-[#02000b] bg-opacity-30 sm:bg-transparent bottom-0 z-50 
      sm:bg-opacity-100 text-white flex fixed right-0 top-0 sm:relative flex-col sm:flex-row backdrop-blur-sm  w-full
      sm:backdrop-blur-none p-4 sm:p-0 overflow-hidden bg-[url('/header_bg.png')] bg-no-repeat bg-[length:100%_100%]  bg-bottom text-center"
        >
          {leftNav.map((el, index) => (
            <Link key={index} href={el.href}>
              <li className="leading-none border-opacity-30  w-24 h-14 hover:text-[#ff0000]">
                {el.name}
              </li>
            </Link>
          ))}
          <li className="pt-2 pb-6 animate-pulse"><img src="/logo.png" className=" w-16 object-contain" /></li>
          {rightNav.map((el, index) => (
            <Link key={index} href={el.href}>
              <li className="leading-none border-opacity-30 w-24 h-14  hover:text-[#ff0000]">
                {el.name}
              </li>
            </Link>
          ))}
        </ul>
      )}
        <div className="cursor-pointer absolute z-50 top-4 right-10 bg-[#FF0000] px-4 py-2 text-xs sm:text-base">
          // Connect Wattle //
          {/* <ul>
            <li onClick={() => connectUnisatWallet() }>UniSat Wallet</li>
            <li onClick={() => connectOKXWallet() }>OKX Wallet</li>
          </ul> */}
        </div>
    </>
  );
}
