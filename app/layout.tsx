import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./context/UserContext";
import { PropertyProvider } from "./context/PropertyContext";
import { RentalRequestProvider } from "./context/RentalRequestContext";
import { MessageProvider } from "./components/ui/MessagePopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Irorun Homes - Your Trusted Property Management Partner",
  description: "Irorun Homes - Your Trusted Property Management Partner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MessageProvider>
          <UserProvider>    
            <PropertyProvider>  
              <RentalRequestProvider>  
                {children}
              </RentalRequestProvider>
            </PropertyProvider>
          </UserProvider>
        </MessageProvider>
      </body>
    </html>
  );
}