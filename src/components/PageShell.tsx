import { ReactNode, useEffect } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

interface PageShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const PageShell = ({ children, title, description }: PageShellProps) => {
  useEffect(() => {
    if (title) document.title = title;
    const setMeta = (selector: string, attribute: "name" | "property", key: string, content?: string) => {
      if (!content) return;
      let meta = document.querySelector<HTMLMetaElement>(selector);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, key);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
  }, [title, description]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
};

export default PageShell;
