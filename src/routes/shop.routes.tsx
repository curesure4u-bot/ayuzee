import { Route } from "react-router-dom";
import * as P from "@/routes/lazy/shop";
import { withSuspense } from "@/routes/routeUtils";

export const shopRoutes = (
  <>
    <Route path="/shop" element={withSuspense(<P.Shop />)} />
    <Route path="/shop/conditions" element={withSuspense(<P.ShopByCondition />)} />
    <Route path="/shop/conditions/:slug" element={withSuspense(<P.ConditionProducts />)} />
    <Route path="/shop/panchakarma" element={withSuspense(<P.PanchakarmaShop />)} />
    <Route path="/shop/surgicals" element={withSuspense(<P.AyushSurgicals />)} />
    <Route path="/shop/track" element={withSuspense(<P.TrackOrder />)} />
    <Route path="/shop/prescription" element={withSuspense(<P.PrescriptionUpload />)} />
    <Route path="/shop/treatment-kits" element={withSuspense(<P.TreatmentKits />)} />
    <Route path="/shop/:id" element={withSuspense(<P.ProductDetail />)} />
    <Route path="/cart" element={withSuspense(<P.Cart />)} />
    <Route path="/checkout" element={withSuspense(<P.Checkout />)} />
  </>
);
