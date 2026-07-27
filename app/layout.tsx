import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import './globals.css';

export const metadata: Metadata = {
  title: "Margasiri — Find what's past the milestone",
  description:
    "India's hidden villages, valleys and heritage sites, sorted by live distance from you. English, Hindi and Kannada."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans text-ink">
        <Nav />
        {children}
      </body>
    </html>
  );
}
