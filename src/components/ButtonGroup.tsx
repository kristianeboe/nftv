import React from "react";
import { createStyles, Group, Button } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  button: {
    borderRadius: 0,

    "&:not(:first-of-type)": {
      borderLeftWidth: 0,
    },

    "&:first-of-type": {
      borderTopLeftRadius: theme.radius.sm,
      borderBottomLeftRadius: theme.radius.sm,
    },

    "&:last-of-type": {
      borderTopRightRadius: theme.radius.sm,
      borderBottomRightRadius: theme.radius.sm,
    },
  },
}));

export function ButtonsGroup(props: {
  buttons: {
    label: string;
    onClick: () => void;
  }[];
}) {
  const { classes } = useStyles();
  return (
    <Group grow spacing={0}>
      {props.buttons.map((b) => (
        <Button
          key={b.label}
          variant="light"
          className={classes.button}
          onClick={b.onClick}
        >
          {b.label}
        </Button>
      ))}
    </Group>
  );
}
