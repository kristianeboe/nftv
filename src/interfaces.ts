export interface FeedQuery {
  latestFeedEvents: FeedEvent[];
}

export interface Nft {
  name: string;
  image: string;
  address: string;
  mintAddress: string;
  creators: {
    address: string;
    profile?: {
      handle: string;
      profileImageUrlLowres: string;
    };
  }[];
}

export interface FeedEvent {
  __typename: string;
  feedEventId: string;
  createdAt: string;
  nft?: Nft;
  auctionHouse?: string;
  purchase?: {
    nft?: Nft;
    auctionHouse?: string;
  };
  listing?: {
    nft?: Nft;
    auctionHouse?: string;
  };
  offer?: {
    nft?: Nft;
    auctionHouse?: string;
  };
}
