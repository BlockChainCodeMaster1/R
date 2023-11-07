import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [showNav, setShowNav] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [nav, setNav] = useState([
    {
      name: "Home",
      href: "/",
    },
    {
      name: "INTEGRAL",
      href: "/#data",
    },
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
    if (typeof window.unisat == 'undefined') {
      alert('UniSat Wallet is not installed!');
    }else{
      try {
        let accounts = await window.unisat.requestAccounts();
        alert('connect success')
        console.log(accounts);
      } catch (e) {
        alert('connect failed');
      }
    }
  }

  const connectOKXWallet = async () => {
    if (typeof window.okxwallet == 'undefined') {
      alert('OKX Wallet is not installed!');
    }else{
      try {
        let accounts = await window.okxwallet.bitcoin.connect()
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
      <img src="/logo.png" className="w-9 h-10" alt="logo" />
      {showNav && (
        <ul
          className=" justify-start sm:justify-center gap-4 text-basic bg-[#02000b] bg-opacity-30 sm:bg-transparent bottom-0 z-50 
      sm:bg-opacity-100 text-white flex fixed right-0 top-0 sm:relative w-40 sm:w-auto flex-col sm:flex-row backdrop-blur-sm 
      sm:backdrop-blur-none p-4 sm:p-0 overflow-hidden"
        >
          {nav.map((el, index) => (
            <Link key={index} href={el.href}>
              <li className="px-4 -mr-1 leading-none border-opacity-30">
                {el.name}
              </li>
            </Link>
          ))}
        </ul>
      )}
        {isMobile ? (
        <div
          className=" bg-[#02000b] bg-opacity-30  fixed left-0 right-0 top-0 bottom-0 z-40"
          onClick={() => {
            setShowNav(false);
            setIsMobile(false);
          }}
        ></div>
      ) : 
      (
        <div className=" border cursor-pointer">
          Connect
          <ul>
            <li onClick={() => connectUnisatWallet() }>UniSat Wallet</li>
            <li onClick={() => connectOKXWallet() }>OKX Wallet</li>
          </ul>
        </div>
      )}
    </>
  );
}
