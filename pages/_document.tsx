import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>REVS - Everyone is revolutionaries.</title>
        <meta property="og:title" content="REVS" key="title" />
        <meta name="description" content="Everyone is revolutionaries." key="desc" />
      </Head>
      <body className=' bg-black'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
