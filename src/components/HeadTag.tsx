import Head from "next/head";
import React from "react";

export default function HeadTag() {
  return (
    <Head>
      <title>
        NFTV | A never-ending stream of mints, offers and sales on Solana
      </title>
      <meta
        key="title"
        name="title"
        content="NFTV | A never-ending stream of mints, offers and sales on Solana"
      />
      <meta
        key="description"
        name="description"
        content="Powered by the Holaplex Indexer, this service showcases the raw creativity that happens second to second on the solana blockchain. "
      />

      <meta key="og:type" property="og:type" content="website" />
      <meta
        key="og:url"
        property="og:url"
        content="https://nfttv.vercel.app/"
      />
      <meta
        key="og:title"
        property="og:title"
        content="NFTV | A never-ending stream of mints, offers and sales on Solana"
      />
      <meta
        key="og:description"
        property="og:description"
        content="Powered by the Holaplex Indexer, this service showcases the raw creativity that happens second to second on the solana blockchain. "
      />
      <meta
        key="og:image"
        property="og:image"
        content="https://nfttv.vercel.app/nftv.png"
      />

      <meta
        key="twitter:card"
        property="twitter:card"
        content="summary_large_image"
      />
      <meta
        key="twitter:url"
        property="twitter:url"
        content="https://nfttv.vercel.app/"
      />
      <meta
        key="twitter:title"
        property="twitter:title"
        content="NFTV | A never-ending stream of mints, offers and sales on Solana"
      />
      <meta
        key="twitter:description"
        property="twitter:description"
        content="Powered by the Holaplex Indexer, this service showcases the raw creativity that happens second to second on the solana blockchain. "
      />
      <meta
        key="twitter:image"
        property="twitter:image"
        content="https://nfttv.vercel.app/nftv.png"
      />
    </Head>
  );
}
