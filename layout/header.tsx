import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from 'react-toastify';

const config:Object = 
{
  position: "bottom-left",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
  }

export default function Header() {
  const [showNav, setShowNav] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
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
      name: "Launch",
      href: "/#IEO",
    },
    {
      name: "Docs",
      href: "/#IEO",
    }
  ]);

  const [account, setAccount] = useState("")

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
    setShowNav(true)
    if (typeof (window as any).unisat == 'undefined') {
      toast('❌ UniSat Wallet is not installed!', config);
    }else{
      try {
        setShowDialog(false)
        let accounts = await (window as any).unisat.requestAccounts();
        (window as any).account = formatAddress(accounts[0])
        toast('🚀 Connect success!', config);
        setAccount((window as any).account)
        console.log(accounts);
      } catch (e) {
        toast('❌ Connect failed', config);
      }
    }
  }

  const connectOKXWallet = async () => {
    if (typeof (window as any).okxwallet == 'undefined') {
      toast('❌ OKX Wallet is not installed!', config);
    }else{
      try {
        setShowDialog(false)
        let accounts = await (window as any).okxwallet.bitcoin.connect()
        toast('🚀 Connect success!', config);
        (window as any).account = formatAddress(accounts['address'])
        setAccount((window as any).account)
        console.log(accounts);
      } catch (e) {
        console.log(e);
        toast('❌ Connect failed', config);
      }
    }
  }

  const formatAddress = (address:string) => { 
      return address.substr(0, 8) + '......' + address.substr(address.length - 8, 8) 
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
        <div onClick={()=>{ setShowDialog(true) }} className="cursor-pointer absolute z-50 top-4 right-10 bg-[#FF0000] px-4 py-2 text-xs sm:text-base">
          {account == "" ? "// Connect Wattle //" : (window as any).account }
        </div>
        {showDialog && <div className="fixed left-0 top-0 right-0 bottom-0 bg-black bg-opacity-50 justify-center items-center z-50">
            <ul className=" bg-[url('/ieo_border.png')] bg-no-repeat bg-[length:100%_100%] -ml-48 -mt-32 px-10 py-14 w-3/12 flex gap-10 absolute left-1/2 top-1/2 justify-center">
              <li className=" cursor-pointer" onClick={() => connectUnisatWallet()}>
                <img src="/unisat.png" className=" w-12 m-auto" />
                <p className=" py-4">UniSat Wallet</p>
              </li>
              <li className=" cursor-pointer" onClick={() => connectOKXWallet() }>
                <img src="/okx.png" className=" w-12 m-auto"  />
                <p className=" py-4">OKX Wallet</p>
              </li>
            </ul> 
        </div>
        }
    </>
  );
}
