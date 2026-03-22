import './globals.css';

export const metadata = {
  title: 'Link Tracker Dashboard',
  description: 'Premium Link Tracking System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
