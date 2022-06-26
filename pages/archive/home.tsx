import { Affix, Button, Center, Container, Paper, Text } from "@mantine/core";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useQuery } from "urql";

import { useEffect, useRef, useState } from "react";
import { useWindowScroll } from "@mantine/hooks";
import { useIntersection } from "@mantine/hooks";
import Marquee from "react-fast-marquee";
import { InView } from "react-intersection-observer";
import { showNotification } from "@mantine/notifications";
import { StatsGroup } from "../../src/components/Stats";
import { ButtonsGroup } from "../../src/components/ButtonGroup";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { FeedEvent, FeedQuery } from "../../src/interfaces";
import { Navbar } from "../../src/components/Navbar";

const FEED_EVENT_BASE_FRAGMENT = `
    feedEventId
    createdAt
    walletAddress
    profile {
      handle
      profileImageUrlLowres
    }
`;
const NFT_FRAGMENT = `
    nft {
      address
      mintAddress
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
          profileImageUrlLowres
        }
      }
      address
      mintAddress
    }
`;

const RAW_FEED_QUERY = `
  query rawFeed($limit: Int!, $isForward: Boolean!, $cursor: String!, $includeTypes: [String!] ) {
    latestFeedEvents(limit: $limit, isForward: $isForward, cursor: $cursor, includeTypes: $includeTypes ) {
      __typename
      ... on MintEvent {
        ${FEED_EVENT_BASE_FRAGMENT}
        ${NFT_FRAGMENT}
      }
      ... on OfferEvent {
        ${FEED_EVENT_BASE_FRAGMENT}
        offer {
          auctionHouse
          ${NFT_FRAGMENT}
        }
      }
      ... on PurchaseEvent {
        ${FEED_EVENT_BASE_FRAGMENT}
        purchase {
          auctionHouse
          ${NFT_FRAGMENT}
        }
      }
      ... on ListingEvent {
        ${FEED_EVENT_BASE_FRAGMENT}
        listing {
          auctionHouse
          ${NFT_FRAGMENT}
        }
      }
    }
  }
`;

const fetchLimit = 100;

export default function OldHomePage() {
  const [lastQueryTimeStamp, setLastQueryTimeStamp] = useState(() =>
    new Date().toISOString()
  );
  const [queryVars, setQueryVars] = useState({
    limit: fetchLimit,
    isForward: false,
    cursor: lastQueryTimeStamp,
    includeTypes: ["mint"],
  });
  const [timeTofetchNewEvents, setTimeToFetchNewEvents] = useState(false);
  const [result, reexecuteQuery] = useQuery<FeedQuery>({
    query: RAW_FEED_QUERY,
    variables: queryVars,
    // pause: true,
  });

  const { data, fetching, error } = result;

  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(0);

  const [newEventsQuery, getMoreNewEvents] = useQuery<FeedQuery>({
    query: RAW_FEED_QUERY,
    variables: {
      limit: 50,
      isForward: true,
      cursor: events[0]?.createdAt,
    },
    pause: true,
  });

  const {
    data: newData,
    fetching: gettingMoreItems,
    error: newError,
  } = newEventsQuery;

  const [newEvents, setNewEvents] = useState<FeedEvent[]>([]);

  useEffect(() => {
    // console.log("creating interval");
    const intervalId = setInterval(() => {
      // console.log("rexecuting query");
      // reexecuteQuery({ requestPolicy: "network-only" });
      getMoreNewEvents({ requestPolicy: "network-only" });
    }, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    console.log("fetch new", {
      gettingMoreItems,
      newData,
    });
    const ne = newData?.latestFeedEvents
      .filter(
        (v, i, a) =>
          v.nft && a.findIndex((v2) => v2.feedEventId === v.feedEventId) === i
      )
      .map((fe) => ({
        ...fe,
        nft: fe.nft || fe.purchase?.nft || fe.listing?.nft || fe.offer?.nft,
        auctionHouse:
          fe.purchase?.auctionHouse ||
          fe.listing?.auctionHouse ||
          fe.offer?.auctionHouse,
      }));
    if (ne?.length) {
      setNewEvents(ne);
    }
  }, [newEventsQuery]);

  useEffect(() => {
    const feedEvents = data?.latestFeedEvents ?? [];
    // console.log("fetch effect", {
    //   fetching,
    //   feedEvents,
    // });
    if (!fetching && data) {
      const newEvents = feedEvents
        // make unique
        // unify interface
        .map((fe) => ({
          ...fe,
          nft: fe.nft || fe.purchase?.nft || fe.listing?.nft || fe.offer?.nft,
          auctionHouse:
            fe.purchase?.auctionHouse ||
            fe.listing?.auctionHouse ||
            fe.offer?.auctionHouse,
        }))
        .filter(
          (v, i, a) =>
            v.nft && a.findIndex((v2) => v2.feedEventId === v.feedEventId) === i
        );
      setEventsLoaded(eventsLoaded + newEvents.length);
      const allEvents = [
        ...events, // .slice(events.length - Math.floor(fetchLimit / 2)),
        ...newEvents,
      ];

      setEvents(allEvents);
    }
  }, [result]);

  const fetchMoreIndex = events.length - 5;

  function fetchMoreEvents(inView: boolean) {
    if (inView) {
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

  return (
    <div>
      <div
        style={{
          minHeight: "100vh",
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
        {/* <Container mb={40}>
          <ButtonsGroup
            buttons={[
              {
                label: "Mints",
                onClick: () => {
                  setQueryVars({ ...queryVars, includeTypes: ["mint"] }),
                    reexecuteQuery({ requestPolicy: "network-only" });
                },
              },
              {
                label: "Offers",
                onClick: () => {
                  setQueryVars({ ...queryVars, includeTypes: ["offer"] }),
                    reexecuteQuery({ requestPolicy: "network-only" });
                },
              },
              {
                label: "Purchases",
                onClick: () => {
                  setQueryVars({ ...queryVars, includeTypes: ["purchase"] }),
                    reexecuteQuery({ requestPolicy: "network-only" });
                },
              },
              {
                label: "Listings",
                onClick: () => {
                  setQueryVars({ ...queryVars, includeTypes: ["listing"] }),
                    reexecuteQuery({ requestPolicy: "network-only" });
                },
              },
            ]}
          />
        </Container> */}
        {/* <p>Total events: {fetching ? "fetching" : events.length}</p>
      <p>
        New events since arrival:{" "}
        {gettingMoreItems ? "fetching" : newEvents.length}
      </p> */}
        <div>
          {error && <Text align="center">{error.message}</Text>}
          {/* <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={events.length}
                itemSize={600}
                layout="horizontal"
                width={width}
              >
                {events?.map((fi, i) => (
                  <div
                    data-has-ref={i === fetchMoreIndex ? true : false}
                    className="w-96 flex-shrink-0"
                    key={i}
                  >
                    {i === fetchMoreIndex && (
                      <InView
                        as="div"
                        threshold={0.1}
                        onChange={(inView) => fetchMoreEvents(inView)}
                      ></InView>
                    )}

                    <FeedCard feedEvent={fi} key={fi.feedEventId} />
                  </div>
                ))}
              </List>
            )}
          </AutoSizer> */}

          {events.length ? (
            <Marquee
              pauseOnClick={true}
              speed={events.length ? 200 : 0}
              gradient={false}
              // pauseOnHover={true}
            >
              {/* <div
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
              </div>
              */}
              {/* <AutoSizer>
                {({ height, width }) => (
                  <List
                    height={height}
                    itemCount={events.length}
                    itemSize={600}
                    layout="horizontal"
                    width={width}
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
                            onChange={(inView) => fetchMoreEvents(inView)}
                          ></InView>
                        )}

                        <FeedCard feedEvent={fi} key={fi.feedEventId} />
                      </div>
                    ))}
                  </List>
                )}
              </AutoSizer> */}
            </Marquee>
          ) : (
            <Center>
              <LoadingSpinner />
            </Center>
          )}
          {newEvents.length ? (
            <Affix position={{ bottom: 20, right: 20 }}>
              <Button
                variant="gradient"
                gradient={{ from: "#ed6ea0", to: "#ec8c69", deg: 35 }}
                onClick={() => {
                  setEvents([...newEvents, ...events.slice(0, 10)]);
                  setNewEvents([]);
                }}
              >
                {newEvents.length} have been loaded since you arrived, click to
                view them{" "}
              </Button>
            </Affix>
          ) : null}
        </div>
      </div>
      <Container mb={200}>
        <StatsGroup
          data={[
            {
              title: "Events loaded",
              stats: "" + eventsLoaded,
              description: "",
            },
            {
              title: "New events waiting",
              stats: "" + newEvents.length,
              description: "",
            },
            {
              title: "Events displayed right now",
              stats: "" + events.length,
              description: "",
            },
          ]}
        />
      </Container>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      width="57"
      height="57"
      viewBox="0 0 57 57"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#fff"
    >
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeWidth="2">
          <circle cx="5" cy="50" r="5">
            <animate
              attributeName="cy"
              begin="0s"
              dur="2.2s"
              values="50;5;50;50"
              calcMode="linear"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              begin="0s"
              dur="2.2s"
              values="5;27;49;5"
              calcMode="linear"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="27" cy="5" r="5">
            <animate
              attributeName="cy"
              begin="0s"
              dur="2.2s"
              from="5"
              to="5"
              values="5;50;50;5"
              calcMode="linear"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              begin="0s"
              dur="2.2s"
              from="27"
              to="27"
              values="27;49;5;27"
              calcMode="linear"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="49" cy="50" r="5">
            <animate
              attributeName="cy"
              begin="0s"
              dur="2.2s"
              values="50;50;5;50"
              calcMode="linear"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              from="49"
              to="49"
              begin="0s"
              dur="2.2s"
              values="49;5;27;49"
              calcMode="linear"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>
    </svg>
  );
}
