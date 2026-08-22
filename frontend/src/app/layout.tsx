import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";

// ⚠️ IMPORTANT: Adjust these paths if your actual folders start with Capital letters
import { Providers } from "@/Providers/Providers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Advanced CRM Dashboard",
  description: "Premium customer management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, geist.variable, "bg-background text-foreground h-screen w-screen overflow-hidden")}>
        
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Providers>
            
            {/* 🚀 THE MASTER LAYOUT CONTAINER */}
            <div className="flex h-full w-full">
              
              {/* Left Side: Fixed Sidebar */}
              <Sidebar />
              
              {/* Right Side: Header + Main Dashboard Content */}
              <div className="flex flex-col flex-1 h-full min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto bg-[#0a0d14] dark:bg-[#0a0d14]">
                  {children}
                </main>
              </div>

            </div>

            <Toaster richColors position="top-right" />
            
          </Providers>
        </ThemeProvider>

      </body>
    </html>
  );
}