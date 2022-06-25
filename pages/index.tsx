import { Container, Paper, Text } from "@mantine/core";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useQuery } from "urql";
import { FeedCard } from "../components/FeedCard";
import { Navbar } from "../components/Navbar";
import styles from "../styles/Home.module.css";
import { SimpleGrid } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useWindowScroll } from "@mantine/hooks";
import { useIntersection } from "@mantine/hooks";
import Marquee from "react-fast-marquee";
import { InView } from "react-intersection-observer";

const auctionHouses = {
  hola: "Holaplex",
  "3o9d13qUvEuuauhFrVom1vuCzgNsJifeaBYDPquaT73Y": "Open Sea",
};

const FEED_EVENT_BASE_FRAGMENT = `
    feedEventId
    createdAt
    walletAddress
    profile {
      handle
      profileImageUrl
    }
`;
const NFT_FRAGMENT = `
    nft {
      name
      image(width: 600)
      description
      owner {
        address
        associatedTokenAccountAddress
        twitterHandle
      }
      sellerFeeBasisPoints
      primarySaleHappened
      creators {
        address
        position
        profile {
          handle
          profileImageUrl
        }
      }
      address
      mintAddress
    }
`;

// feedEvents(wallet: "ALphA7iWKMUi8owfbSKFm2i3BxG6LbasYYXt8sP85Upz", limit: 25, offset: 0, excludeTypes: ["follow"]) {
// latestFeedEvents(limit: 25, offset: 0, excludeTypes: ["mint","follow"]) {
// (args: { fetchOlderEvents: boolean; cursor: Date }) =>
const RAW_FEED_QUERY = `
  query rawFeed($limit: Int!, $isForward: Boolean!, $cursor: String! ) {
    latestFeedEvents(limit: $limit, isForward: $isForward, cursor: $cursor , includeTypes: ["mint"] ) {
      __typename
      ... on MintEvent {
        ${FEED_EVENT_BASE_FRAGMENT}
        ${NFT_FRAGMENT}
      }
      ... on OfferEvent {
        ${FEED_EVENT_BASE_FRAGMENT}
        offer {
          ${NFT_FRAGMENT}
        }
      }
      ... on PurchaseEvent {
        ${FEED_EVENT_BASE_FRAGMENT}
        purchase {
          ${NFT_FRAGMENT}
        }
      }
      ... on ListingEvent {
        ${FEED_EVENT_BASE_FRAGMENT}
        listing {
          ${NFT_FRAGMENT}
        }
      }
    }
  }
`;

interface FeedQuery {
  latestFeedEvents: FeedEvent[];
}

interface Nft {
  name: string;
  image: string;
  creators: {
    address: string;
    profile?: {
      handle: string;
      profileImageUrl: string;
    };
  }[];
}

export interface FeedEvent {
  __typename: string;
  feedEventId: string;
  createdAt: string;
  nft?: Nft;
  purchase?: {
    nft?: Nft;
  };
  listing?: {
    nft?: Nft;
  };
  offer?: {
    nft?: Nft;
  };
}

function HomePage() {
  const [lastQueryTimeStamp, setLastQueryTimeStamp] = useState(() =>
    new Date().toISOString()
  );
  const [queryVars, setQueryVars] = useState({
    limit: 8,
    isForward: false,
    cursor: lastQueryTimeStamp,
  });
  const [timeTofetchNewEvents, setTimeToFetchNewEvents] = useState(false);
  const [result, reexecuteQuery] = useQuery<FeedQuery>({
    query: RAW_FEED_QUERY,
    variables: queryVars,
    // pause: true,
    // ({
    //   fetchOlderEvents: true,
    //   cursor: new Date(),
    // }),
  });

  // const [newEvents, getMoreNewEvents] = useQuery<FeedQuery>({
  //   query: RAW_FEED_QUERY({
  //     fetchOlderEvents: false,
  //     cursor: new Date(),
  //   }),
  // });

  useEffect(() => {
    // console.log("creating interval");
    const intervalId = setInterval(() => {
      // console.log("rexecuting query");
      // reexecuteQuery({ requestPolicy: "network-only" });
    }, 10 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const { data, fetching, error } = result;

  const [events, setEvents] = useState<FeedEvent[]>([]);

  useEffect(() => {
    const feedEvents = data?.latestFeedEvents ?? [];
    // console.log("fetch effect", {
    //   fetching,
    //   feedEvents,
    // });
    if (!fetching && data) {
      const newEvents = feedEvents
        .filter(
          (v, i, a) =>
            a.findIndex((v2) => v2.feedEventId === v.feedEventId) === i
        )
        .map((fe) => ({
          ...fe,
          nft: fe.nft || fe.purchase?.nft || fe.listing?.nft || fe.offer?.nft,
        }))
        .filter(
          (fe) =>
            fe.nft &&
            fe.__typename !== "FollowEvent" &&
            !events.some((e) => fe.feedEventId === e.feedEventId)
        );
      // console.log("found", newEvents.length, "new events");
      const allEvents = [...events, ...newEvents];
      // console.log(allEvents.length, "events total");
      setEvents(allEvents);
    }
  }, [result]);

  const fetchMoreIndex = events.length - 3;

  function fetchMoreEvents(inView: boolean) {
    if (inView) {
      console.log("fetch more", {
        events,
        lastEvent: events.at(-1),
        lastEventTs: events.at(-1)?.createdAt!,
      });
      setTimeToFetchNewEvents(inView);
      setQueryVars({
        ...queryVars,
        cursor: events.at(-1)?.createdAt!,
      });
      reexecuteQuery({
        requestPolicy: "network-only",
      });
    }
  }

  // console.log("test", observedEntry);
  // console.log("events", events);
  return (
    <div>
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
      <p>Total events: {events.length}</p>
      <div>
        {/* {fetching && <Text align="center">Loading...</Text>} */}
        {error && <Text align="center">{error.message}</Text>}

        {/* <div
          // className={
          //   "grid grid-flow-col gap-8 overflow-x-scroll py-2 pl-8 no-scrollbar"
          // }
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gap: "24px",
            margin: "0 24px",
            overflowX: "scroll",
          }}
        >
          {events.map((fi, i) => (
            <div
              ref={i === fetchMoreIndex ? ref : null}
              data-has-ref={i === fetchMoreIndex ? true : false}
              className="w-96 flex-shrink-0"
              key={i}
            >
              {i === fetchMoreIndex && (
                <InView
                  as="div"
                  threshold={0.1}
                  onChange={(inView) => console.log(i, "in view", inView)}
                ></InView>
              )}
              <FeedCard feedEvent={fi} key={fi.feedEventId} />
              <p>{i}</p>
              {observedEntry?.isIntersecting && <div>Has ref</div>}
            </div>
          ))}
        </div> */}

        <Marquee
          speed={events.length ? 200 : 0}
          gradient={false}
          // pauseOnHover={true}
        >
          <div
            // className={
            //   "grid grid-flow-col gap-8 overflow-x-scroll py-2 pl-8 no-scrollbar"
            // }
            style={{
              display: "grid",
              gridAutoFlow: "column",
              gap: "24px",
              margin: "0 24px",
              // overflow: "scroll",
            }}
          >
            {events.map((fi, i) => (
              <div
                data-has-ref={i === fetchMoreIndex ? true : false}
                className="w-96 flex-shrink-0"
                key={i}
              >
                {i === fetchMoreIndex && (
                  <InView
                    as="div"
                    threshold={0.1}
                    onChange={(inView) =>
                      console.log(i, "in view", inView) ||
                      fetchMoreEvents(inView)
                    }
                  ></InView>
                )}
                <p>
                  {i}{" "}
                  {i === fetchMoreIndex && timeTofetchNewEvents
                    ? "- Time to fetch new events"
                    : ""}
                </p>
                <FeedCard feedEvent={fi} key={fi.feedEventId} />
              </div>
            ))}
          </div>
        </Marquee>

        {/* <SimpleGrid cols={1}>
          {events.map((fe) => (
            <div key={fe.feedEventId} style={{ width: 600, margin: "auto" }}>
              <FeedCard key={fe.feedEventId} feedEvent={fe} />
            </div>
          ))}
        </SimpleGrid> */}
      </div>
    </div>
  );
}

export default HomePage;
