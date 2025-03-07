// src/app/layout.tsx
import './styles/globals.css';
import './styles/fonts.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fantasy Combat Game',
  description: 'A turn-based combat game with Knight and Wizard characters',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}