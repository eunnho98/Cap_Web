import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';
import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';

const theme = extendTheme({
  fonts: {
    heading: `'Jua', sans-serif`,
    body: `'Jua', sans-serif`,
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <RecoilRoot>
        <SessionProvider session={pageProps.session}>
          <Component {...pageProps} />
        </SessionProvider>
      </RecoilRoot>
    </ChakraProvider>
  );
}

export default MyApp;
