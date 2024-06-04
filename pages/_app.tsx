import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { OrderProvider } from '../context/OrderContext';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <OrderProvider>
            <Component {...pageProps} />
        </OrderProvider>
    );
}

export default MyApp;
