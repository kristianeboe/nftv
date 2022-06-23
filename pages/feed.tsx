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

const limit = 25;
const query = "graphql";

const RAW_FEED_QUERY = `
  query rawFeed {
    feedEvents(wallet: "NWswq7QR7E1i1jkdkddHQUFtRPihqBmJ7MfnMCcUf4H", offset: $offset}, limit: $limit, excludeTypes: ["follow", "offer", "purchase"]) {
      __typename
      ... on MintEvent {
        profile {
          handle
          profileImageUrl
        }
        walletAddress
        feedEventId

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
        
      }
    }
  }
`;

interface FeedQuery {
  feedEvents: FeedEvent[];
}

export interface FeedEvent {
  __typename: string;
  feedEventId: string;
  nft: {
    name: string;
    image: string;
  };
}

function FeedEvents(props: { offset: number }) {
  const [result, reexecuteQuery] = useQuery<FeedQuery>({
    query: RAW_FEED_QUERY,
    variables: {
      limit,
      offset: props.offset,
    },
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      reexecuteQuery();
    }, 30 * 1000);
  });

  const { data, fetching, error } = result;

  const feedEvents = data?.feedEvents ?? [];

  return (
    <>
      {fetching && <Text align="center">Loading...</Text>}
      {error && <p>{error.message}</p>}
      {feedEvents.map((fe) => (
        <div key={fe.feedEventId} style={{ width: 600, margin: "auto" }}>
          <FeedCard key={fe.feedEventId} feedEvent={fe} />
        </div>
      ))}
    </>
  );
}

const Home: NextPage = () => {
  const [pageVariables, setPageVariables] = useState([
    {
      query,
      offset: 0,
    },
  ]);

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
        <SimpleGrid cols={1}>
          {pageVariables.map((variables, i) => (
            <FeedEvents key={i} offset={variables.offset} />
          ))}
        </SimpleGrid>
      </Container>
    </div>
  );
};

export default Home;
