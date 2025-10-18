
import '@/styles/globals.css';
import '@/styles/main.css'

import { Poppins } from 'next/font/google';
import type { ChildrenProps } from '@/types';
import { QueryProvider } from '@/providers/query';
import Navbar from '@/components/Navbar.tsx';

export const metadata = {
  description:
    'Owl Client Application',
  keywords:
    'next, typescript, tailwind css, prettier, eslint, husky, seo',
  title: 'Owl',
};

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  weight: ['400', '700'],
});

export default async function RootLayout({ children }: ChildrenProps) {

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <title>{metadata.title}</title>
        <link rel="icon" href="assets/images/logo.png" />
      </head>
      <body
        className={`${poppins.className} h-full flex flex-col justify-between`}
      >
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places`}
          async
          defer
        />
        <section className="flex-1">
          <>
          <Navbar />
          <QueryProvider>{children}</QueryProvider>
          </>
        </section>
      </body>
    </html>
  );
}
