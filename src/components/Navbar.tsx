import React, { useState } from "react";
import {
  createStyles,
  Header,
  Group,
  ActionIcon,
  Container,
  Burger,
  Button,
  Title,
} from "@mantine/core";
import { useBooleanToggle } from "@mantine/hooks";
import { BrandTwitter, BrandYoutube, BrandInstagram } from "tabler-icons-react";

const useStyles = createStyles((theme) => ({
  inner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,

    [theme.fn.smallerThan("sm")]: {
      justifyContent: "flex-start",
    },
  },

  links: {
    width: 260,

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  social: {
    width: 260,

    [theme.fn.smallerThan("sm")]: {
      width: "auto",
      marginLeft: "auto",
    },
  },

  burger: {
    marginRight: theme.spacing.md,

    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.25)
          : theme.colors[theme.primaryColor][0],
      color:
        theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 3 : 7],
    },
  },
}));

interface NavbarProps {
  links: { link: string; label: string }[];
}

export function Navbar({ links }: NavbarProps) {
  const [opened, toggleOpened] = useBooleanToggle(false);
  const [active, setActive] = useState(links[0].link);
  const { classes, cx } = useStyles();

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={cx(classes.link, {
        [classes.linkActive]: active === link.link,
      })}
      target="_blank"
      onClick={(event) => {
        setActive(link.link);
      }}
      rel="noreferrer"
    >
      {link.label}
    </a>
  ));

  return (
    <Header height={56} mb={40}>
      <Container className={classes.inner}>
        {/* <Burger
          opened={opened}
          onClick={() => toggleOpened()}
          size="sm"
          className={classes.burger}
        /> */}
        <Group className={classes.links} spacing={5}>
          {items}
        </Group>

        {/* <MantineLogo /> */}
        <Title
          style={{
            fontFamily: "Audiowide",
          }}
          order={1}
        >
          NFTv
        </Title>

        <Group spacing={0} className={classes.social} position="right" noWrap>
          <a
            href="https://holaplex.com/alpha"
            target={"_blank"}
            rel="noreferrer"
          >
            <Button
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
            >
              Create your own feed
            </Button>
          </a>

          {/* <ActionIcon size="lg">
            <BrandTwitter size={18} />
          </ActionIcon>
          <ActionIcon size="lg">
            <BrandYoutube size={18} />
          </ActionIcon>
          <ActionIcon size="lg">
            <BrandInstagram size={18} />
          </ActionIcon> */}
        </Group>
      </Container>
    </Header>
  );
}
