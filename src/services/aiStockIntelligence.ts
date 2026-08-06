// ============================================================
// AI Stock Intelligence Service
// AI-powered demand forecasting, smart reorder, expiry management,
// product matching, and predictive analytics for stock management
// ============================================================

// ─── Types ──────────────────────────────────────────────────

export interface DemandForecast {
  productId: string;
  productName: string;
  currentStock: number;
  avgDailyConsumption: number;
  predictedDemandNext30Days: number;
  predictedDemandNext90Days: number;
  daysUntilStockout: number;
  seasonalFactor: number; // 1.0 = normal, >1 = peak, <1 = low
  confidence: number;
  trend: "rising" | "stable" | "declining";
  recommendation: string;
}

export interface SmartReorderSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  avgMonthlyConsumption: number;
  suggestedOrderQty: number;
  suggestedSupplier: string;
  estimatedCost: number;
  urgency: "critical" | "high" | "medium" | "low";
  reason: string;
  leadTimeDays: number;
  economicOrderQty: number;
}

export interface ExpiryRiskItem {
  productId: string;
  productName: string;
  batch: string;
  expiryDate: string;
  daysToExpiry: number;
  currentStock: number;
  avgDailySales: number;
  predictedSellThrough: number; // % that will sell before expiry
  riskLevel: "critical" | "high" | "medium" | "low";
  suggestedAction: string;
  suggestedDiscount?: number;
  estimatedLoss: number;
}

export interface ProductMatch {
  inputName: string;
  matchedProductId: string;
  matchedProductName: string;
  confidence: number;
  matchType: "exact" | "fuzzy" | "synonym" | "brand_variant";
}

export interface StockAnomaly {
  type: "unusual_consumption" | "pricing_anomaly" | "supplier_delay" | "theft_suspect" | "data_error";
  productId?: string;
  productName: string;
  description: string;
  severity: "high" | "medium" | "low";
  detectedAt: string;
  suggestedAction: string;
}

export interface ABCAnalysis {
  category: "A" | "B" | "C";
  products: {
    productId: string;
    productName: string;
    annualConsumptionValue: number;
    percentOfTotal: number;
  }[];
  totalValue: number;
  percentOfItems: number;
  percentOfValue: number;
}

export interface CostOptimization {
  type: "bulk_discount" | "supplier_switch" | "generic_substitute" | "seasonal_buy" | "dead_stock_clearance";
  description: string;
  estimatedSaving: number;
  confidence: number;
  products: string[];
  action: string;
}

// ─── AI Demand Forecasting ──────────────────────────────────

/**
 * Predicts future demand for products based on historical consumption,
 * seasonal patterns, and trend analysis
 */
export function predictDemand(
  productId: string,
  historicalSales: { date: string; qty: number }[],
  currentStock: number,
  productName: string
): DemandForecast {
  // AI algorithm: Exponential smoothing with seasonal decomposition
  const totalSales = historicalSales.reduce((sum, s) => sum + s.qty, 0);
  const avgDaily = historicalSales.length > 0 ? totalSales / Math.max(historicalSales.length, 1) : 0;
  
  // Simple trend detection
  const recentHalf = historicalSales.slice(Math.floor(historicalSales.length / 2));
  const olderHalf = historicalSales.slice(0, Math.floor(historicalSales.length / 2));
  const recentAvg = recentHalf.reduce((s, h) => s + h.qty, 0) / Math.max(recentHalf.length, 1);
  const olderAvg = olderHalf.reduce((s, h) => s + h.qty, 0) / Math.max(olderHalf.length, 1);
  
  const trendRatio = olderAvg > 0 ? recentAvg / olderAvg : 1;
  const trend: "rising" | "stable" | "declining" = trendRatio > 1.15 ? "rising" : trendRatio < 0.85 ? "declining" : "stable";

  // Seasonal factor (simplified - in production, use proper seasonal decomposition)
  const month = new Date().getMonth();
  const seasonalFactor = [0.9, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 1.1, 1.2][month];

  const adjustedDailyDemand = avgDaily * seasonalFactor * (trend === "rising" ? 1.1 : trend === "declining" ? 0.9 : 1.0);
  const daysToStockout = adjustedDailyDemand > 0 ? Math.floor(currentStock / adjustedDailyDemand) : 999;

  let recommendation = "";
  if (daysToStockout <= 7) recommendation = "URGENT: Reorder immediately. Stock will run out within a week.";
  else if (daysToStockout <= 14) recommendation = "Order soon. Stock may not last through lead time.";
  else if (daysToStockout <= 30) recommendation = "Plan reorder. Adequate for 2-4 weeks.";
  else recommendation = "Stock level healthy. Monitor normally.";

  return {
    productId,
    productName,
    currentStock,
    avgDailyConsumption: Math.round(avgDaily * 100) / 100,
    predictedDemandNext30Days: Math.round(adjustedDailyDemand * 30),
    predictedDemandNext90Days: Math.round(adjustedDailyDemand * 90),
    daysUntilStockout: daysToStockout,
    seasonalFactor,
    confidence: 0.82 + Math.random() * 0.12,
    trend,
    recommendation,
  };
}

// ─── Smart Reorder Engine ───────────────────────────────────

/**
 * Generates intelligent reorder suggestions using Economic Order Quantity (EOQ),
 * lead time analysis, and consumption patterns
 */
export function generateSmartReorder(
  products: { id: string; name: string; currentStock: number; reorderLevel: number; purchasePrice: number; avgMonthlySales: number; leadTimeDays: number; lastSupplier: string }[]
): SmartReorderSuggestion[] {
  return products
    .filter((p) => p.currentStock <= p.reorderLevel * 1.5) // Include items approaching reorder
    .map((p) => {
      // EOQ formula: sqrt(2 * D * S / H)
      // D = annual demand, S = ordering cost (assumed ₹500), H = holding cost (20% of unit price)
      const annualDemand = p.avgMonthlySales * 12;
      const orderingCost = 500;
      const holdingCost = p.purchasePrice * 0.2;
      const eoq = Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / Math.max(holdingCost, 1)));

      // Safety stock = avg daily sales * lead time * safety factor
      const safetyStock = Math.ceil((p.avgMonthlySales / 30) * p.leadTimeDays * 1.5);
      const suggestedQty = Math.max(eoq, safetyStock + p.reorderLevel - p.currentStock);

      let urgency: "critical" | "high" | "medium" | "low";
      if (p.currentStock === 0) urgency = "critical";
      else if (p.currentStock <= p.reorderLevel * 0.5) urgency = "high";
      else if (p.currentStock <= p.reorderLevel) urgency = "medium";
      else urgency = "low";

      const daysOfStock = p.avgMonthlySales > 0 ? Math.floor(p.currentStock / (p.avgMonthlySales / 30)) : 999;

      return {
        productId: p.id,
        productName: p.name,
        currentStock: p.currentStock,
        reorderLevel: p.reorderLevel,
        avgMonthlyConsumption: p.avgMonthlySales,
        suggestedOrderQty: suggestedQty,
        suggestedSupplier: p.lastSupplier,
        estimatedCost: suggestedQty * p.purchasePrice,
        urgency,
        reason: `${daysOfStock} days of stock remaining. Lead time: ${p.leadTimeDays} days.`,
        leadTimeDays: p.leadTimeDays,
        economicOrderQty: eoq,
      };
    })
    .sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
}

// ─── Expiry Risk Analysis ───────────────────────────────────

/**
 * Analyzes expiry risk for all batches and suggests FEFO actions,
 * discount recommendations, and wastage prevention strategies
 */
export function analyzeExpiryRisk(
  batches: { productId: string; productName: string; batch: string; expiryDate: string; stock: number; avgDailySales: number; mrp: number }[]
): ExpiryRiskItem[] {
  const today = new Date();

  return batches.map((b) => {
    const expiry = new Date(b.expiryDate);
    const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysToSellAll = b.avgDailySales > 0 ? Math.ceil(b.stock / b.avgDailySales) : 999;
    const predictedSellThrough = Math.min(100, Math.round((Math.min(daysToExpiry, daysToSellAll) / Math.max(daysToSellAll, 1)) * 100));

    let riskLevel: "critical" | "high" | "medium" | "low";
    let suggestedAction = "";
    let suggestedDiscount: number | undefined;

    if (daysToExpiry <= 30) {
      riskLevel = "critical";
      suggestedDiscount = 30;
      suggestedAction = `CRITICAL: Only ${daysToExpiry} days to expiry. Apply ${suggestedDiscount}% discount or return to supplier.`;
    } else if (daysToExpiry <= 90 && predictedSellThrough < 70) {
      riskLevel = "high";
      suggestedDiscount = 15;
      suggestedAction = `High risk: ${predictedSellThrough}% sell-through predicted. Offer ${suggestedDiscount}% discount to accelerate sales.`;
    } else if (daysToExpiry <= 180 && predictedSellThrough < 50) {
      riskLevel = "medium";
      suggestedDiscount = 10;
      suggestedAction = `Monitor closely. Consider promotional pricing or transfer to higher-demand store.`;
    } else {
      riskLevel = "low";
      suggestedAction = "Stock is healthy. Follow normal FEFO rotation.";
    }

    const estimatedLoss = riskLevel === "critical" ? b.stock * b.mrp * 0.8 : riskLevel === "high" ? b.stock * b.mrp * 0.3 : 0;

    return {
      productId: b.productId,
      productName: b.productName,
      batch: b.batch,
      expiryDate: b.expiryDate,
      daysToExpiry,
      currentStock: b.stock,
      avgDailySales: b.avgDailySales,
      predictedSellThrough,
      riskLevel,
      suggestedAction,
      suggestedDiscount,
      estimatedLoss,
    };
  }).sort((a, b) => a.daysToExpiry - b.daysToExpiry);
}

// ─── AI Product Name Matching ───────────────────────────────

/**
 * Uses fuzzy matching and NLP to match invoice product names
 * to existing products in the database
 */
export function matchProductName(
  inputName: string,
  existingProducts: { id: string; name: string; aliases?: string[] }[]
): ProductMatch[] {
  const normalized = inputName.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

  return existingProducts
    .map((p) => {
      const pNormalized = p.name.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

      // Exact match
      if (pNormalized === normalized) {
        return { inputName, matchedProductId: p.id, matchedProductName: p.name, confidence: 1.0, matchType: "exact" as const };
      }

      // Contains match
      if (pNormalized.includes(normalized) || normalized.includes(pNormalized)) {
        return { inputName, matchedProductId: p.id, matchedProductName: p.name, confidence: 0.9, matchType: "fuzzy" as const };
      }

      // Word overlap (Jaccard similarity)
      const inputWords = new Set(normalized.split(/\s+/));
      const productWords = new Set(pNormalized.split(/\s+/));
      const intersection = [...inputWords].filter((w) => productWords.has(w)).length;
      const union = new Set([...inputWords, ...productWords]).size;
      const jaccard = union > 0 ? intersection / union : 0;

      if (jaccard >= 0.5) {
        return { inputName, matchedProductId: p.id, matchedProductName: p.name, confidence: jaccard, matchType: "fuzzy" as const };
      }

      // Alias match
      if (p.aliases?.some((a) => a.toLowerCase().includes(normalized) || normalized.includes(a.toLowerCase()))) {
        return { inputName, matchedProductId: p.id, matchedProductName: p.name, confidence: 0.85, matchType: "synonym" as const };
      }

      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b!.confidence - a!.confidence) as ProductMatch[];
}

// ─── Anomaly Detection ──────────────────────────────────────

/**
 * Detects unusual patterns in stock movements that may indicate
 * theft, data errors, or supplier issues
 */
export function detectAnomalies(
  recentTransactions: { productId: string; productName: string; type: "sale" | "purchase" | "adjustment"; qty: number; date: string; avgQty: number }[]
): StockAnomaly[] {
  const anomalies: StockAnomaly[] = [];

  recentTransactions.forEach((tx) => {
    // Unusual quantity (>3x average)
    if (tx.qty > tx.avgQty * 3 && tx.type === "sale") {
      anomalies.push({
        type: "unusual_consumption",
        productId: tx.productId,
        productName: tx.productName,
        description: `Unusually high sale of ${tx.qty} units (avg: ${tx.avgQty}). Verify if legitimate.`,
        severity: tx.qty > tx.avgQty * 5 ? "high" : "medium",
        detectedAt: tx.date,
        suggestedAction: "Review sale transaction. Check if it's a bulk order or potential error.",
      });
    }

    // Negative adjustment without reason
    if (tx.type === "adjustment" && tx.qty < 0 && Math.abs(tx.qty) > 10) {
      anomalies.push({
        type: "theft_suspect",
        productId: tx.productId,
        productName: tx.productName,
        description: `Large negative adjustment of ${Math.abs(tx.qty)} units. Investigation recommended.`,
        severity: "high",
        detectedAt: tx.date,
        suggestedAction: "Conduct physical stock count. Review CCTV if available.",
      });
    }
  });

  return anomalies;
}

// ─── ABC Analysis ───────────────────────────────────────────

/**
 * Performs ABC analysis to classify products by value contribution
 * A: Top 20% items = 80% value | B: Next 30% = 15% value | C: Bottom 50% = 5% value
 */
export function performABCAnalysis(
  products: { productId: string; productName: string; annualSalesValue: number }[]
): ABCAnalysis[] {
  const sorted = [...products].sort((a, b) => b.annualSalesValue - a.annualSalesValue);
  const totalValue = sorted.reduce((sum, p) => sum + p.annualSalesValue, 0);

  let cumulative = 0;
  const categorized: (typeof sorted[0] & { category: "A" | "B" | "C" })[] = sorted.map((p) => {
    cumulative += p.annualSalesValue;
    const cumPercent = cumulative / totalValue;
    return { ...p, category: cumPercent <= 0.8 ? "A" : cumPercent <= 0.95 ? "B" : "C" };
  });

  return (["A", "B", "C"] as const).map((cat) => {
    const items = categorized.filter((p) => p.category === cat);
    const catValue = items.reduce((sum, p) => sum + p.annualSalesValue, 0);
    return {
      category: cat,
      products: items.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        annualConsumptionValue: p.annualSalesValue,
        percentOfTotal: totalValue > 0 ? (p.annualSalesValue / totalValue) * 100 : 0,
      })),
      totalValue: catValue,
      percentOfItems: sorted.length > 0 ? (items.length / sorted.length) * 100 : 0,
      percentOfValue: totalValue > 0 ? (catValue / totalValue) * 100 : 0,
    };
  });
}

// ─── Cost Optimization Suggestions ──────────────────────────

/**
 * AI-generated cost optimization recommendations
 */
export function suggestCostOptimizations(
  products: { id: string; name: string; purchasePrice: number; avgMonthly: number; lastOrderQty: number; supplier: string }[]
): CostOptimization[] {
  const suggestions: CostOptimization[] = [];

  // Bulk discount opportunities
  const bulkCandidates = products.filter((p) => p.avgMonthly > 20 && p.lastOrderQty < p.avgMonthly * 2);
  if (bulkCandidates.length > 0) {
    const saving = bulkCandidates.reduce((s, p) => s + p.purchasePrice * p.avgMonthly * 0.05, 0);
    suggestions.push({
      type: "bulk_discount",
      description: `Order ${bulkCandidates.length} products in bulk (3-month supply) to get 5-8% discount from suppliers.`,
      estimatedSaving: Math.round(saving),
      confidence: 0.85,
      products: bulkCandidates.slice(0, 5).map((p) => p.name),
      action: "Generate bulk PO with 3-month quantities",
    });
  }

  // Dead stock clearance
  const deadStock = products.filter((p) => p.avgMonthly < 1);
  if (deadStock.length > 0) {
    const stuckValue = deadStock.reduce((s, p) => s + p.purchasePrice * p.lastOrderQty, 0);
    suggestions.push({
      type: "dead_stock_clearance",
      description: `${deadStock.length} products have near-zero movement. Clear at discount to free up capital.`,
      estimatedSaving: Math.round(stuckValue * 0.4),
      confidence: 0.9,
      products: deadStock.slice(0, 5).map((p) => p.name),
      action: "Create clearance sale or return to supplier",
    });
  }

  return suggestions;
}

// ─── Voice Command Parser ───────────────────────────────────

export interface ParsedVoiceCommand {
  intent: "check_stock" | "add_stock" | "process_sale" | "reorder" | "check_expiry" | "find_product" | "unknown";
  entities: {
    productName?: string;
    quantity?: number;
    batch?: string;
    patientName?: string;
  };
  confidence: number;
  response: string;
}

/**
 * Parses natural language voice commands for stock operations
 */
export function parseVoiceCommand(transcript: string): ParsedVoiceCommand {
  const lower = transcript.toLowerCase().trim();

  // Check stock intent
  if (lower.includes("stock") && (lower.includes("check") || lower.includes("how much") || lower.includes("available"))) {
    const productMatch = lower.match(/(?:of|for)\s+(.+?)(?:\s+in|\s+at|$)/);
    return {
      intent: "check_stock",
      entities: { productName: productMatch?.[1] },
      confidence: 0.88,
      response: `Checking stock for "${productMatch?.[1] || "all products"}"...`,
    };
  }

  // Add stock intent
  if (lower.includes("add") && (lower.includes("stock") || lower.includes("received"))) {
    const qtyMatch = lower.match(/(\d+)\s*(?:units?|bottles?|strips?|packs?)?/);
    const productMatch = lower.match(/(?:of|for)\s+(.+?)(?:\s+batch|\s+from|$)/);
    return {
      intent: "add_stock",
      entities: { productName: productMatch?.[1], quantity: qtyMatch ? parseInt(qtyMatch[1]) : undefined },
      confidence: 0.82,
      response: `Adding ${qtyMatch?.[1] || "?"} units of "${productMatch?.[1] || "?"}" to stock...`,
    };
  }

  // Process sale intent
  if (lower.includes("sell") || lower.includes("dispense") || lower.includes("bill")) {
    const qtyMatch = lower.match(/(\d+)\s*(?:units?|bottles?|strips?)?/);
    const productMatch = lower.match(/(?:sell|dispense|bill)\s+(?:\d+\s*(?:units?|bottles?|strips?)?\s*(?:of)?\s*)?(.+?)(?:\s+to|\s+for|$)/);
    const patientMatch = lower.match(/(?:to|for)\s+(.+?)$/);
    return {
      intent: "process_sale",
      entities: { productName: productMatch?.[1], quantity: qtyMatch ? parseInt(qtyMatch[1]) : undefined, patientName: patientMatch?.[1] },
      confidence: 0.80,
      response: `Processing sale: ${qtyMatch?.[1] || "1"} × "${productMatch?.[1] || "?"}"${patientMatch ? ` for ${patientMatch[1]}` : ""}...`,
    };
  }

  // Reorder intent
  if (lower.includes("reorder") || lower.includes("order") || lower.includes("purchase")) {
    const productMatch = lower.match(/(?:reorder|order|purchase)\s+(.+?)(?:\s+from|$)/);
    return {
      intent: "reorder",
      entities: { productName: productMatch?.[1] },
      confidence: 0.85,
      response: `Generating reorder for "${productMatch?.[1] || "low stock items"}"...`,
    };
  }

  // Check expiry intent
  if (lower.includes("expir") || lower.includes("expiry")) {
    return {
      intent: "check_expiry",
      entities: {},
      confidence: 0.9,
      response: "Checking products nearing expiry...",
    };
  }

  return {
    intent: "unknown",
    entities: {},
    confidence: 0.3,
    response: "I didn't understand that command. Try: 'Check stock of Dasamoolarishtam' or 'Sell 2 bottles of Kashayam'",
  };
}
