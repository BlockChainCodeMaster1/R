import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>REVS - Everyone is revolutionaries.</title>
        <meta property="og:title" content="REVS" key="title" />
        <meta name="description" content="Everyone is revolutionaries." key="desc" />
        <Script id="google-analytics" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-53ZVBGXR');
        `}
      </Script>
      </Head>
      <body className=' bg-black'>
        <Main />
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-53ZVBGXR" height="0" width="0" style={{display:"none",visibility:"hidden"}}></iframe></noscript>
        <NextScript />
      </body>
    </Html>
  )
}
