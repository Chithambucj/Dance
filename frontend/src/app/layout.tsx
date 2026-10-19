import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Caveat } from "next/font/google";
import "./globals.css";
import AnimatedCursor from "@/components/AnimatedCursor";
import InitialAppLoader from "@/components/InitialAppLoader";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import DashboardLoadingManager from "@/components/DashboardLoadingManager";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const caveat = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "StepUp Dance Studio",
  description: "Express. Learn. Grow. Join our expert-led dance classes and discover the joy of movement.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${caveat.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("stepup-theme");var d=s==="dark"||(!s&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>
          <NavigationProgressBar />
          <InitialAppLoader />
          <DashboardLoadingManager />
          <AnimatedCursor />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

