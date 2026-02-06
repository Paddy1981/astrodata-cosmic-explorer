import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarField from "@/components/StarField";

export const metadata: Metadata = {
  title: "AstroData Cosmic Explorer | Learn Space the Fun Way",
  description:
    "A fun, interactive space learning platform for students and hobbyists. Explore the cosmos, play games, discover exoplanets, and learn astronomy through hands-on experiences. By Larun Engineering.",
  keywords: [
    "astronomy",
    "space learning",
    "exoplanets",
    "stargazing",
    "moon phases",
    "meteor showers",
    "sky bingo",
    "planet hunter",
    "star stories",
    "larun",
  ],
  authors: [{ name: "Larun Engineering", url: "https://laruneng.com" }],
  openGraph: {
    title: "AstroData Cosmic Explorer",
    description: "Learn space the fun way - games, discoveries, and real astronomy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StarField />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
