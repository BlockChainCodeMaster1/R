import Head from 'next/head';
import Header from './header';
import Footer from './footer';
import React, { useState, useEffect } from 'react';
import Script from 'next/script';

const HeaderFooter = (props:any) => {
  const { activeIndex } = props;

  return (
    <div>
       <header>
          <div className=' flex flex-row justify-between p-4'>
            <Header/>
          </div>
        </header>
      <div>{props.children}</div>
      <Footer />
    </div>
  );
};

export default HeaderFooter;
