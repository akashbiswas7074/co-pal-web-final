import './globals.css';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import Layout from '@/components/layout/Layout';
import ClientProviders from '@/components/wrappers/ClientProviders';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { generateDynamicMetadata } from '@/lib/metadata';
import DynamicThemeProvider from '@/components/providers/DynamicThemeProvider';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

// Generate metadata dynamically from your website settings
import { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export async function generateMetadata(): Promise<Metadata> {
  const dynamicMeta = await generateDynamicMetadata({
    type: 'website'
  });

  return {
    ...dynamicMeta,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Peeds',
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className} w-full min-h-screen`} suppressHydrationWarning>
        <ClientProviders>
          <DynamicThemeProvider>
            <Layout>
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
              {children}
            </Layout>
          </DynamicThemeProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
