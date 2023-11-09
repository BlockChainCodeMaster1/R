import Head from 'next/head';
import Header from './header';
import Footer from './footer';
import React, { useState, useEffect } from 'react';
import Script from 'next/script';

const HeaderFooter = (props:any) => {
  const { activeIndex } = props;

  return (
    <div>
       <header className=' fixed left-0 right-0 top-0 z-50'>
          <div className='flex flex-row justify-center font-[digitalists]'>
            <Header/>
          </div>
        </header>
      <div>{props.children}</div>
      <Footer />
    </div>
  );
};

export default HeaderFooter;
