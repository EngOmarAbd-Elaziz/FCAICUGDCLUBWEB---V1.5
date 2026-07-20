import type { Metadata } from 'next';
import './globals.css';
import LayoutShell from '@/components/layout/LayoutShell';

export const metadata: Metadata = {
  title: 'FCAI CU Game Development Club',
  description: 'Join the premier game development community at FCAI. Learn, create, and innovate in the world of gaming.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css?family=Noto+Nastaliq+Urdu:regular,500,600,700" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=BBH+Bartle:regular" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Aref+Ruqaa+Ink:regular,700" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Handjet:100,200,300,regular,500,600,700,800,900" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
