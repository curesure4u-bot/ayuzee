import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Coins,
  Gift,
  History,
  Loader2,
  ShoppingBag,
  Tag,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { useCoinStore, type StoreItem } from "@/hooks/useCoinStore";

const CATEGORIES = ["All", "Voucher", "Course", "Merchandise", "Certificate", "Feature", "General"];

const categoryIcon: Record<string, string> = {
  Voucher: "🎟️",
  Course: "📚",
  Merchandise: "👕",
  Certificate: "🏅",
  Feature: "⚡",
  General: "📦",
};

const CoinStore = () => {
  const { items, redemptions, coinBalance, loading, redeemItem } = useCoinStore();
  const [tab, setTab] = useState("store");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [confirmItem, setConfirmItem] = useState<StoreItem | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const filtered = useMemo(() => {
    if (categoryFilter === "All") return items;
    return items.filter((i) => i.category === categoryFilter);
  }, [items, categoryFilter]);

  const handleRedeem = async () => {
    if (!confirmItem) return;
    setRedeeming(true);
    const result = await redeemItem(confirmItem);
    setRedeeming(false);
    setConfirmItem(null);

    if (result.success) {
      toast.success(`Redeemed "${confirmItem.title}"! Check your history for details.`);
    } else {
      toast.error(result.error || "Redemption failed");
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header with balance */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" /> Coin Store
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Spend your earned coins on rewards, vouchers, and perks
          </p>
        </div>
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Coins className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-amber-700">Your Balance</p>
              <p className="text-xl font-bold text-amber-800">{coinBalance} coins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="store" className="gap-1.5">
            <Gift className="h-3.5 w-3.5" /> Store
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-3.5 w-3.5" /> My Redemptions
          </TabsTrigger>
        </TabsList>

        {/* Store Tab */}
        <TabsContent value="store" className="space-y-4 mt-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className="text-xs"
              >
                {cat !== "All" && <span className="mr-1">{categoryIcon[cat]}</span>}
                {cat}
              </Button>
            ))}
          </div>

          <Badge variant="outline">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} available
          </Badge>

          {/* Items Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.length === 0 ? (
              <Card className="sm:col-span-2">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No items in this category.
                </CardContent>
              </Card>
            ) : (
              filtered.map((item) => {
                const canAfford = coinBalance >= item.coin_price;
                const inStock = item.stock === -1 || item.stock > 0;
                return (
                  <Card key={item.id} className="hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{categoryIcon[item.category] || "📦"}</span>
                            <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Coins className="h-3 w-3" /> {item.coin_price}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {item.category}
                          </Badge>
                          {item.stock !== -1 && (
                            <span className="text-[10px] text-muted-foreground">
                              <Package className="h-3 w-3 inline mr-0.5" />
                              {item.stock} left
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          disabled={!canAfford || !inStock}
                          onClick={() => setConfirmItem(item)}
                        >
                          {!inStock ? "Sold Out" : !canAfford ? "Need More" : "Redeem"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-3 mt-4">
          {redemptions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                <Gift className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                No redemptions yet. Browse the store and spend your coins!
              </CardContent>
            </Card>
          ) : (
            redemptions.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      {r.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : r.status === "cancelled" ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{r.item_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.redeemed_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Coins className="h-3 w-3" /> -{r.coins_spent}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1 capitalize">{r.status}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmItem} onOpenChange={(open) => !open && setConfirmItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
            <AlertDialogDescription>
              Redeem <strong>{confirmItem?.title}</strong> for{" "}
              <strong>{confirmItem?.coin_price} coins</strong>?
              <br />
              <span className="text-xs">
                Your balance after: {coinBalance - (confirmItem?.coin_price || 0)} coins
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={redeeming}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRedeem} disabled={redeeming}>
              {redeeming ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CoinStore;
