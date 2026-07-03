import { Route } from "react-router-dom";
import * as P from "@/routes/lazyPages";
import { withSuspense } from "@/routes/routeUtils";

export const venueRoutes = (
  <>
    <Route path="/venue" element={withSuspense(<P.VenueLayout />)}>
      <Route index element={withSuspense(<P.VenueDashboard />)} />
      <Route path="rooms" element={withSuspense(<P.VenueRooms />)} />
      <Route path="bookings" element={withSuspense(<P.VenueBookings />)} />
      <Route path="revenue" element={withSuspense(<P.VenueRevenue />)} />
      <Route path="profile" element={withSuspense(<P.VenueProfile />)} />
    </Route>
  </>
);
