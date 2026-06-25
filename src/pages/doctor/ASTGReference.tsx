import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, BookmarkCheck, Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/data/astg";

export default function ASTGReference() {
  const [selectedKey, setSelectedKey] = useState<string>(CATEGORIES[0].key);
  const [query, setQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const selected = CATEGORIES.find((c) => c.key === selectedKey) ?? CATEGORIES[0];

  const filteredDiseases = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return selected.diseases;
    return selected.diseases.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.modern.toLowerCase().includes(q),
    );
  }, [query, selected]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="container py-6">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Ayurvedic Standard Treatment Guidelines
          </h1>
          <p className="text-sm text-muted-foreground">
            Ministry of AYUSH, Govt. of India — 2017 Edition
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary">AYUSH</Badge>
            <Badge variant="outline">38 Diseases</Badge>
            <Badge variant="outline">13 Srotas</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search diseases or medicines…"
              className="w-64 pl-8"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Bookmarks
            <Badge variant="secondary" className="ml-1">
              {bookmarks.size}
            </Badge>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Body Systems (Srotas)
          </p>
          {CATEGORIES.map((c) => {
            const active = c.key === selectedKey;
            return (
              <button
                key={c.key}
                onClick={() => setSelectedKey(c.key)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/30 hover:bg-muted/50",
                )}
              >
                <span className="text-xl leading-none">{c.icon}</span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{c.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {c.modern} · {c.diseases.length}{" "}
                    {c.diseases.length === 1 ? "disease" : "diseases"}
                  </span>
                </span>
              </button>
            );
          })}
        </aside>

        <main>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-2xl">{selected.icon}</span>
            <div>
              <h2 className="text-xl font-semibold">{selected.name}</h2>
              <p className="text-sm text-muted-foreground">{selected.modern}</p>
            </div>
          </div>

          {filteredDiseases.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No diseases match "{query}" in this category.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDiseases.map((dx) => {
                const id = `${selected.key}-${dx.ch}`;
                const bookmarked = bookmarks.has(id);
                const hasProtocol = !!dx.levels?.length;
                return (
                  <Card key={id} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="outline" className="mb-2 text-xs">
                            Chapter {dx.ch}
                          </Badge>
                          <CardTitle className="text-lg leading-tight">
                            {dx.name}
                          </CardTitle>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {dx.modern}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={
                            bookmarked ? "Remove bookmark" : "Add bookmark"
                          }
                          onClick={() => toggleBookmark(id)}
                        >
                          {bookmarked ? (
                            <BookmarkCheck className="h-5 w-5 text-primary" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto pt-2">
                      <Button
                        asChild={hasProtocol}
                        variant="secondary"
                        className="w-full justify-between"
                        disabled={!hasProtocol}
                      >
                        {hasProtocol ? (
                          <Link
                            to={`/doctor/astg-reference/${selected.key}/${dx.key}`}
                          >
                            View Protocol
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <span>
                            Protocol coming soon
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
