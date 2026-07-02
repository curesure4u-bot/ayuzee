import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/common/PageSEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <PageSEO
        title="Page Not Found"
        description="The page you are looking for does not exist on Ayuzee."
        noIndex
      />
      <div className="flex min-h-screen items-center justify-center bg-muted px-4">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">404</p>
          <h1 className="mb-3 mt-2 font-display text-3xl font-bold">Page not found</h1>
          <p className="mb-6 text-muted-foreground">
            We could not find <span className="font-mono text-sm">{location.pathname}</span>.
          </p>
          <Button asChild>
            <Link to="/">Return to home</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default NotFound;
