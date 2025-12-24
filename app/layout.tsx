import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sistem Informasi Ayam Petelur',
  description: 'Aplikasi manajemen peternakan ayam petelur',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
