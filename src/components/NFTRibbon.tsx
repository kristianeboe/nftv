import { useInterval } from "@/hooks/useInterval";
import { Affix, Alert, Button, Center, Header, Title } from "@mantine/core";
import React, { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { InView } from "react-intersection-observer";
import { AlertCircle } from "tabler-icons-react";
import { useQuery } from "urql";
import { RAW_FEED_QUERY } from "../graphql";
import { FeedEvent, FeedQuery } from "../interfaces";
import { FeedCard } from "./FeedCard";
import { LoadingSpinner } from "./LoadingSpinner";
const fetchLimit = 200;
const fetchNewLimit = 50;

export default function NFTRibbon(props: { includeTypes: string[] }) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(0);

  const fetchMoreIndex = events.length - 25;
  const [queryVars, setQueryVars] = useState({
    limit: fetchLimit,
    isForward: false,
    cursor: new Date().toISOString(),
    includeTypes: props.includeTypes,
  });

  function fetchMoreEvents(inView: boolean) {
    if (inView) {
      setQueryVars({
        ...queryVars,
        cursor: events.at(-1)?.createdAt!,
      });
    }
  }

  const [result, reexecuteQuery] = useQuery<FeedQuery>({
    query: RAW_FEED_QUERY,
    variables: queryVars,
    // pause: true,
  });

  const [newEventsQuery, getMoreNewEvents] = useQuery<FeedQuery>({
    query: RAW_FEED_QUERY,
    variables: {
      limit: fetchNewLimit,
      isForward: true,
      cursor: events[0]?.createdAt,
      includeTypes: props.includeTypes,
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

  useInterval(
    () => getMoreNewEvents({ requestPolicy: "network-only" }),
    120 * 1000
  );

  const { data, fetching, error } = result;

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

  useEffect(() => {
    if (!fetching) {
      reexecuteQuery({
        requestPolicy: "network-only",
      });
    }
  }, [queryVars]);

  const header =
    props.includeTypes[0][0].toUpperCase() + props.includeTypes[0].slice(1);

  return (
    <div>
      <Title
        order={2}
        style={{
          marginLeft: 24,
        }}
      >
        {header} events
      </Title>
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
            {newEvents.length} {props.includeTypes[0]} events have been loaded
            since you arrived, click to view them
          </Button>
        </Affix>
      ) : null}
      {error && (
        <Alert icon={<AlertCircle size={16} />} title="Bummer!" color="red">
          {error.message}{" "}
        </Alert>
      )}
    </div>
  );
}
