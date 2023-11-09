export default function Footer() {
  return (
    <footer className=" text-center">
        <div className="font-[digitalists] inline-flex bg-[#ff0000] px-4 py-2 rounded-full gap-2 text-white items-center">
          <div>Social</div>
          <img src="/icon_tw.png" className=" w-4 sm:w-8 object-fill cursor-pointer " />
          <img src="/icon_tg.png" className=" w-4 sm:w-8 object-fill cursor-pointer" />
          {/* <div className="bg-[url('/icon_tg.png)] w-40 h-6 bg-no-repeat bg-center"></div>
          <div className="bg-[url('/icon_tw.png)] w-12 h-6 bg-no-repeat bg-center"></div> */}
        </div>
        <div className=" border-t border-[#ff0000] mt-4 sm:mt-10 p-4">
          <div className="w-12/12 sm:w-8/12 m-auto  flex justify-between">
            <img src="/logo.png" className="w-4  object-fill sm:w-8" />
            <span className=" sm:text-base text-xs  text-[#ff0000]">© 2023 SEVS</span>
          </div>
        </div>
    </footer>
  );
}
