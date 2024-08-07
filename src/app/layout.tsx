import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "../component/sidebar";
import "./globals.css";
import styles from "./layout.module.css";
import { Providers } from "./providers";
import { globals } from "./globals";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Funny Tools",
  description: "好玩有用的工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {globals()}
        <meta
          name="google-site-verification"
          content="dvfyzFzjYXP7eeEEZ0hmtjqEaHx_tmvXtOrmZuoGors"
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <main className={`${styles.main} flex`}>
            <div className="hidden md:block">
              <Sidebar />
            </div>
            <div className="flex-1">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
