import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEntity } from "@/contexts/EntityContext";
import { Building2, Search, MoreHorizontal, ArrowLeftRight, CheckCircle2 } from "lucide-react";

const HmsSwitchEntity = () => {
  const { entities, activeEntity, switchEntity, isLoading } = useEntity();
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("100");

  const filtered = entities.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.key.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase())
  );

  const displayEntities = filtered.slice(0, Number(entriesPerPage));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <ArrowLeftRight className="h-6 w-6 text-orange-500" /> Switch Entity
        </h1>
        <p className="text-sm text-muted-foreground">
          Switch between hospital entities, branches, and franchises
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base text-orange-500 text-center">Switch Entity</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Controls Row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">Show</span>
              <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm">entries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Search:</span>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="h-8 pl-8 w-56"
                  placeholder="Search entities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-orange-600 font-semibold w-16">S.No</TableHead>
                  <TableHead className="text-orange-600 font-semibold">Name</TableHead>
                  <TableHead className="text-orange-600 font-semibold">Key</TableHead>
                  <TableHead className="text-orange-600 font-semibold">Type</TableHead>
                  <TableHead className="text-orange-600 font-semibold w-32 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayEntities.map((entity) => (
                  <TableRow key={entity.id} className={entity.isActive ? "bg-orange-50/60" : ""}>
                    <TableCell className="text-sm">{entity.sNo}</TableCell>
                    <TableCell className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {entity.name}
                        {entity.isActive && (
                          <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0 gap-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Currently Set
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entity.key}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {entity.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {entity.isActive ? (
                        <span className="text-xs text-green-600 font-medium">Currently Set</span>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-orange-500">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => switchEntity(entity.id)}
                              disabled={isLoading}
                              className="cursor-pointer"
                            >
                              <ArrowLeftRight className="h-3.5 w-3.5 mr-2" />
                              Switch
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {displayEntities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No entities found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing 1 to {displayEntities.length} of {filtered.length} entries</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Previous</Button>
              <Button variant="default" size="sm" className="h-7 text-xs bg-orange-500 hover:bg-orange-600">1</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsSwitchEntity;
