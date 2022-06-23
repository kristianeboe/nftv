import { Container, Text } from "@mantine/core";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useQuery } from "urql";
import { FeedCard } from "../components/FeedCard";
import { Navbar } from "../components/Navbar";
import styles from "../styles/Home.module.css";
import { SimpleGrid } from "@mantine/core";
import { useEffect, useState } from "react";

const FEED_EVENT_BASE_FRAGMENT = `
    feedEventId
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
const RAW_FEED_QUERY = `
  query rawFeed {
    latestFeedEvents(limit: 50, offset: 0) {
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
}

export interface FeedEvent {
  __typename: string;
  feedEventId: string;
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
  const [result, reexecuteQuery] = useQuery<FeedQuery>({
    query: RAW_FEED_QUERY,
    variables: {
      $limit: 50,
      $offset: 0,
    },
  });

  useEffect(() => {
    console.log("creating interval");
    const intervalId = setInterval(() => {
      console.log("rexecuting query");
      reexecuteQuery({ requestPolicy: "network-only" });
    }, 10 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const { data, fetching, error } = result;

  const [events, setEvents] = useState<FeedEvent[]>([]);

  useEffect(() => {
    const feedEvents = data?.latestFeedEvents ?? [];
    console.log("fetch effect", {
      fetching,
      feedEvents,
    });
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
      console.log("found", newEvents.length, "new events");
      const allEvents = [...newEvents, ...events];
      console.log(allEvents.length, "events total");
      setEvents(allEvents);
    }
  }, [result]);

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

      <Container>
        {fetching && <Text align="center">Loading...</Text>}
        {error && <Text align="center">{error.message}</Text>}
        <SimpleGrid cols={1}>
          {events.map((fe) => (
            <div key={fe.feedEventId} style={{ width: 600, margin: "auto" }}>
              <FeedCard key={fe.feedEventId} feedEvent={fe} />
            </div>
          ))}
        </SimpleGrid>
      </Container>
    </div>
  );
}

export default HomePage;
