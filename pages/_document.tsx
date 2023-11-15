import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>REVS - Everyone is revolutionaries.</title>
        <meta property="og:title" content="REVS" key="title" />
        <meta name="description" content="Everyone is revolutionaries." key="desc" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-9Z299VN4N0" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
        {`
           window.dataLayer = window.dataLayer || [];
           function gtag(){dataLayer.push(arguments);}
           gtag('js', new Date());
         
           gtag('config', 'G-9Z299VN4N0');
        `}
      </Script>
      </Head>
      <body className=' bg-black'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
