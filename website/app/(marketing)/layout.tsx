import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Marketing-section layout. Wraps the cream editorial homepage and the
 * post-install (greetings) / post-uninstall (farewell) pages with the
 * shared Navbar + Footer.
 *
 * The /docs/* surface uses a different top bar (DocsTop) and intentionally
 * does NOT inherit the marketing chrome — see app/docs/layout.tsx.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
