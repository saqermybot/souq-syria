import "../styles/globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "Souq Syria",
  description: "Marketplace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <body>
        <Header />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
