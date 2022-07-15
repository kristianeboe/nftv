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
  const [lastQueryTimeStamp, setLastQueryTimeStamp] = useState(() =>
    new Date().toISOString()
  );

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     // updateNftsViewed();
  //     setNftsViewed(nftsViewed + 1);
  //   }, 3000);
  //   return () => clearInterval(intervalId);
  // }, []);

  const [queryVars, setQueryVars] = useState({
    limit: fetchLimit,
    isForward: false,
    cursor: lastQueryTimeStamp,
    includeTypes: includeTypes,
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
      limit: fetchNewLimit,
      isForward: true,
      cursor: events[0]?.createdAt,
      includeTypes: includeTypes,
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
    }, 120 * 1000);
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

  const fetchMoreIndex = events.length - 25;

  function fetchMoreEvents(inView: boolean) {
    if (inView) {
      setTimeToFetchNewEvents(inView);
      setQueryVars({
        ...queryVars,
        cursor: events.at(-1)?.createdAt!,
      });
    }
  }

  useEffect(() => {
    if (!fetching) {
      reexecuteQuery({
        requestPolicy: "network-only",
      });
    }
  }, [queryVars]);

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
          {events.length ? (
            <Marquee
              pauseOnClick={true}
              speed={events.length ? 150 : 0}
              gradient={false}
              // pauseOnHover={true}
            >
              <div
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
                        onChange={(inView) => fetchMoreEvents(inView)}
                      ></InView>
                    )}
                    <FeedCard feedEvent={fi} key={fi.feedEventId} />
                  </div>
                ))}
              </div>
            </Marquee>
          ) : (
            <Center
              style={{
                height: "40vh",
              }}
            >
              <LoadingSpinner />
            </Center>
          )}
          <NFTRibbon includeTypes={["mint"]} />
          <NFTRibbon includeTypes={["listing"]} />
          <NFTRibbon includeTypes={["purchase"]} />
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
      <Container>
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
      </Container>

      {error && (
        <Alert icon={<AlertCircle size={16} />} title="Bummer!" color="red">
          {error.message}{" "}
        </Alert>
      )}
    </div>
  );
}

export default HomePage;
