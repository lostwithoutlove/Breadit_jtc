import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/Toaster";
import Providers from "@/components/Providers";
import "@/styles/globals.css";

export const metadata = {
  title: "Breadit",
  description: "A Reddit clone built with Next.js and TypeScript.",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-white text-slate-900 antialiased light",
        inter.className
      )}
    >
      <Providers>
        <Navbar />
        <div className="min-h-screen pt-12 bg-slate-50 antialiased">
          <div className="container max-w-7xl mx-auto h-full pt-12">
            {children}
          </div>
        </div>
      </Providers>
      <Toaster />
    </div>
  );
}
