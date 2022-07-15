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

const AH_FRAGMENT = `
    auctionHouse {
      address
    }
`;

export const RAW_FEED_QUERY = `
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
          ${AH_FRAGMENT}
          ${NFT_FRAGMENT}
        }
      }
      ... on PurchaseEvent {
        ${FEED_EVENT_BASE_FRAGMENT}
        purchase {
          ${AH_FRAGMENT}
          ${NFT_FRAGMENT}
        }
      }
      ... on ListingEvent {
        ${FEED_EVENT_BASE_FRAGMENT}
        listing {
          ${AH_FRAGMENT}
          ${NFT_FRAGMENT}
        }
      }
    }
  }
`;
