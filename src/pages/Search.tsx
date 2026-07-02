import { useEffect, useState } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { GlobalSearch, GlobalSearchResult, runGlobalSearch, searchTabs, SearchType } from "@/components/site/GlobalSearch";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const isSearchType = (value: string | null): value is SearchType => ["doctors", "therapies", "medicines", "courses", "jobs"].includes(value ?? "");

const Search = () => {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const active = isSearchType(params.get("type")) ? params.get("type") as SearchType : "doctors";
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);

  usePageSEO({
    title: query ? `Search ${query} — Ayuzee` : "Search",
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    runGlobalSearch(active, query, 50).then((items) => {
      setResults(items);
      setLoading(false);
    });
  }, [query, active]);

  const changeTab = (type: string) => {
    const next = new URLSearchParams(params);
    next.set("type", type);
    setParams(next);
  };

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b border-border bg-background">
        <div className="container py-10">
          <h1 className="font-display text-4xl font-semibold">Search Ayuzee</h1>
          <p className="mt-2 text-muted-foreground">Find doctors, therapies, medicines, courses and jobs in one place.</p>
          <div className="mt-6 max-w-2xl"><GlobalSearch className="md:w-full lg:w-full" /></div>
        </div>
      </section>

      <section className="container py-8">
        <Tabs value={active} onValueChange={changeTab} className="space-y-6">
          <TabsList className="flex h-auto flex-wrap justify-start">
            {searchTabs.map((tab) => <TabsTrigger key={tab.type} value={tab.type}>{tab.label}</TabsTrigger>)}
          </TabsList>

          {!query.trim() ? (
            <Card className="p-12 text-center"><SearchIcon className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-4 text-muted-foreground">Enter a keyword to start searching.</p></Card>
          ) : loading ? (
            <Card className="p-12 text-center text-muted-foreground">Loading results…</Card>
          ) : results.length === 0 ? (
            <Card className="p-12 text-center"><SearchIcon className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-4 font-medium">No {active} found for “{query}”</p><p className="text-sm text-muted-foreground">Try a different keyword or category.</p></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((result) => (
                <Link key={`${active}-${result.id}`} to={result.href}>
                  <Card className="h-full transition-smooth hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="flex gap-4 p-5">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><result.icon className="h-6 w-6" /></span>
                      <span className="min-w-0"><span className="block font-display text-lg font-semibold leading-tight">{result.title}</span><span className="mt-2 block text-sm text-muted-foreground">{result.subtitle}</span></span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Tabs>
      </section>
    </main>
  );
};

export default Search;
