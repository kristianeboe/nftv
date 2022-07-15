import {
  Affix,
  Alert,
  Button,
  Center,
  Container,
  Paper,
  Text,
} from "@mantine/core";
import Head from "next/head";
import { useQuery } from "urql";
import { FeedCard } from "@/components/FeedCard";
import { Navbar } from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";
import { InView } from "react-intersection-observer";
import { StatsGroup } from "@/components/Stats";
import { FeedEvent, FeedQuery } from "@/interfaces";
import { RAW_FEED_QUERY } from "@/graphql";
import HeadTag from "@/components/HeadTag";
import { AlertCircle } from "tabler-icons-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import NFTRibbon from "@/components/NFTRibbon";

const fetchLimit = 200;
const fetchNewLimit = 50;
const includeTypes = ["mint"];

function HomePage() {
  return (
    <div>
      <HeadTag />
      <div
        style={{
          minHeight: "80vh",
        }}
      >
        <Navbar
          links={[
            {
              label: "Holaplex.com",
              link: "https://holaplex.com",
            },
            {
              label: "Indexer repo",
              link: "https://github.com/holaplex/indexer",
            },
          ]}
        />

        <div>
          <NFTRibbon includeTypes={["mint"]} />
          <NFTRibbon includeTypes={["listing"]} />
          <NFTRibbon includeTypes={["purchase"]} />
        </div>
      </div>
      {/* <Container>
        <StatsGroup
          events={events}
          data={[
            {
              title: "NFTs loaded",
              stats: "" + eventsLoaded,
              description: "",
            },

            {
              title: "New events waiting",
              stats: "" + newEvents.length,
              description: "",
            },
            {
              title: "Events in memory rn",
              stats: "" + events.length,
              description: "",
            },
          ]}
        />
      </Container> */}
    </div>
  );
}

export default HomePage;
