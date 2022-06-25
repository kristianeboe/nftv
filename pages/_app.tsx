import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";

import { createClient, Provider } from "urql";
import Head from "next/head";

const client = createClient({
  url: "https://graph-test.holaplex.com/v1",
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <Provider value={client}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            /** Put your mantine theme override here */
            colorScheme: "dark",
          }}
        >
          <NotificationsProvider>
            <Component {...pageProps} />
          </NotificationsProvider>
        </MantineProvider>
      </Provider>
    </>
  );
}

export default MyApp;
