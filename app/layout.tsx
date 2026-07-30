import type { Metadata } from 'next';
import AppShell from '@/components/AppShell';
import 'maplibre-gl/dist/maplibre-gl.css';
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
