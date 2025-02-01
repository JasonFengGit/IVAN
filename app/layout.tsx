import { Toaster } from 'react-hot-toast'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

import '@/app/globals.css'
import { cn } from '@/lib/utils'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Providers } from '@/components/providers'
import { WalletProviders, NextAuthProvider } from './providers';
import '@mysten/dapp-kit/dist/index.css';


const metadata = {
  metadataBase: new URL(`http://localhost:3000`),
  title: {
    default: 'IVAN',
    template: `%s - IVAN`
  },
  description: '',
  icons: {
    icon: '/favicon.ico',
    shortcut:'/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'IVAN',
    description: '',
    url: ``,
    siteName: 'IVAN',
    images: [
      {
        url: '', 
        width: 1080,
        height: 578,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export const viewport = {
  themeColor: [
   { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode,
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <title>{metadata.title.default}</title>
      <meta name="description" content={metadata.description} />
      <link rel="icon" href={metadata.icons.icon} />
      <link rel="apple-touch-icon" href={metadata.icons.apple} />
      <link rel="shortcut icon" href={metadata.icons.shortcut} />
      
      {/* Open Graph / Facebook Meta Tags */}
      <meta property="og:title" content={metadata.openGraph.title} />
      <meta property="og:description" content={metadata.openGraph.description} />
      <meta property="og:url" content={metadata.openGraph.url} />
      <meta property="og:site_name" content={metadata.openGraph.siteName} />
      <meta property="og:image" content={metadata.openGraph.images[0].url} />
      <meta property="og:image:width" content={metadata.openGraph.images[0].width.toString()} />
      <meta property="og:image:height" content={metadata.openGraph.images[0].height.toString()} />
      <meta property="og:type" content={metadata.openGraph.type} />
      <meta property="og:locale" content={metadata.openGraph.locale} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@" />
      <meta name="twitter:title" content={metadata.openGraph.title} />
      <meta name="twitter:description" content={metadata.openGraph.description} />
      <meta name="twitter:image" content={metadata.openGraph.images[0].url} />
      
      </head>
      <body
        className={cn(
          'font-sans antialiased',
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <Toaster toastOptions={{
            className: '',
            style: {
              borderRadius: '10px',
              background: '#fafafa',
              color: '#013359',
              borderColor:"#013359",
              borderWidth:"2px",
              fontFamily:"DM Sans",
              fontWeight:"500",
            },
            iconTheme: {
              primary: '#013359',
              secondary: '#fafafa',
            },
          }}
        />
        <NextAuthProvider>
        <WalletProviders>
        <Providers
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen"> {/* tune dark  bg-muted/50 */}
            {/*<Header />*/}
            <main className="flex flex-col flex-1">{children}</main>
          </div>
          <TailwindIndicator />
        </Providers>
        </WalletProviders>
        </NextAuthProvider>
      </body>
      
    </html>
  )
}

