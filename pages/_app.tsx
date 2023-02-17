import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { AppProps } from "next/app";
import Head from "next/head";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

const theme = createTheme();

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Head>
          <title>Chá de Casamento</title>
          <link
            rel="shortcut icon"
            href="https://png.pngtree.com/png-vector/20190826/ourmid/pngtree-house-location-icon-png-image_1701248.jpg"
            type="image/jpg"
          />
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <CssBaseline />
        <Component {...pageProps} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default MyApp;
