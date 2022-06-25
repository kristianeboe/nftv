import React from "react";
import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  createStyles,
  Center,
  Button,
} from "@mantine/core";
import { GasStation, Gauge, ManualGearbox, Users } from "tabler-icons-react";
import { DateTime } from "luxon";
import { FeedEvent } from "../pages";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  imageSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },

  label: {
    marginBottom: theme.spacing.xs,
    lineHeight: 1,
    fontWeight: 700,
    fontSize: theme.fontSizes.xs,
    letterSpacing: -0.25,
    textTransform: "uppercase",
  },

  section: {
    padding: theme.spacing.md,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },

  icon: {
    marginRight: 5,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[5],
  },
}));

const mockdata = [
  { label: "4 passengers", icon: Users },
  { label: "100 km/h in 4 seconds", icon: Gauge },
  { label: "Automatic gearbox", icon: ManualGearbox },
  { label: "Electric", icon: GasStation },
];

export function FeedCard(props: { feedEvent: FeedEvent }) {
  const { classes } = useStyles();
  const nft = props.feedEvent.nft!;
  const features = mockdata.map((feature) => (
    <Center key={feature.label}>
      <feature.icon size={18} className={classes.icon} />
      <Text size="xs">{feature.label}</Text>
    </Center>
  ));

  const creator = nft.creators[0];

  return (
    <Card withBorder radius="md" className={classes.card}>
      <Card.Section className={classes.imageSection}>
        <Image width={400} height={400} src={nft.image} alt={nft.name} />
      </Card.Section>

      <Group position="apart" mt="md">
        <div>
          <Text weight={500}>{nft.name}</Text>
          <Text size={"sm"} weight={300}>
            By{" "}
            {(creator.profile?.handle && "@" + creator.profile?.handle) ||
              creator.address.slice(0, 4) + "..."}
          </Text>
        </div>
        <div>
          <Badge variant="outline">{props.feedEvent.__typename}</Badge>
          <Text weight={400}>
            {DateTime.fromISO(props.feedEvent.createdAt).toRelative()}
          </Text>
        </div>
      </Group>
      <a href={"https://holaplex.com/nfts/" + nft.address}>
        <Group mt="xs">
          <Button radius="md" fullWidth style={{ flex: 1 }}>
            View on Holaplex
          </Button>
          {/* <ActionIcon variant="default" radius="md" size={36}>
          <Heart size={18} className={classes.like} />
        </ActionIcon> */}
        </Group>
      </a>
    </Card>
  );
}
