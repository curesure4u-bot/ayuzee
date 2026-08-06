import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PharmacyInvoice = () => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Pharmacy Invoice</h2>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Generate pharmacy invoices from sale bills. Select a date range and store to generate consolidated invoices.
          </p>
          <div className="mt-4">
            <Button className="bg-orange-600 hover:bg-orange-700">Generate Invoice</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyInvoice;
