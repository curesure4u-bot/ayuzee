import { useEffect, useState } from "react";
import { GitBranch, Users, UserCheck, Building2, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoleCount {
  role: string;
  count: number;
  users: string[];
}

export default function AdminOrganogram() {
  const [loading, setLoading] = useState(true);
  const [roleCounts, setRoleCounts] = useState<Record<string, RoleCount>>({});
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [therapistsCount, setTherapistsCount] = useState(0);
  const [venuesCount, setVenuesCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch platform user roles
        const { data: roles } = await (supabase as any)
          .from("platform_user_roles")
          .select("role, user_id");

        const roleMap: Record<string, RoleCount> = {};
        (roles || []).forEach((r: any) => {
          if (!roleMap[r.role]) {
            roleMap[r.role] = { role: r.role, count: 0, users: [] };
          }
          roleMap[r.role].count += 1;
          roleMap[r.role].users.push(r.user_id);
        });
        setRoleCounts(roleMap);

        // Counts
        const { count: dCount } = await (supabase as any)
          .from("doctors")
          .select("*", { count: "exact", head: true });
        setDoctorsCount(dCount || 0);

        const { count: tCount } = await (supabase as any)
          .from("therapists")
          .select("*", { count: "exact", head: true });
        setTherapistsCount(tCount || 0);

        const { count: vCount } = await (supabase as any)
          .from("therapy_venues")
          .select("*", { count: "exact", head: true });
        setVenuesCount(vCount || 0);
      } catch (error) {
        console.error("Error fetching organogram data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRoleCount = (role: string) => roleCounts[role]?.count || 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <GitBranch className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">Platform Hierarchy</h1>
          <p className="text-muted-foreground">Organizational structure</p>
        </div>
      </div>

      {/* Org Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Chart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Super Admin Level */}
          <div className="p-4 border-2 border-purple-300 rounded-lg bg-purple-50">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="font-bold text-lg">Super Admin</span>
              <Badge className="bg-purple-600">Top Level</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Jasir Sajidh, Dr. Saleem</p>
          </div>

          {/* Second Level */}
          <div className="ml-8 space-y-3">
            {/* Regional Admins */}
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Regional Admins</span>
                <Badge variant="secondary">
                  {loading ? "..." : getRoleCount("regional_admin")} assigned
                </Badge>
              </div>

              {/* Third Level under Regional */}
              <div className="ml-8 mt-3 space-y-2">
                <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Venue Managers</span>
                    <Badge variant="outline" className="text-xs">
                      {loading ? "..." : venuesCount} venues
                    </Badge>
                  </div>
                  <div className="ml-8 mt-2">
                    <div className="p-2 border rounded bg-green-25 border-green-100">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-green-600" />
                        <span className="text-sm">Therapists (assigned to venue)</span>
                        <Badge variant="outline" className="text-xs">
                          {loading ? "..." : therapistsCount} total
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-lg bg-teal-50 border-teal-200">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-teal-600" />
                    <span className="font-medium text-sm">Doctors (in region)</span>
                    <Badge variant="outline" className="text-xs">
                      {loading ? "..." : doctorsCount} total
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Admin */}
            <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-amber-600" />
                <span className="font-semibold">Content Admin</span>
                <Badge variant="secondary">
                  {loading ? "..." : getRoleCount("content_admin")} assigned
                </Badge>
              </div>
            </div>

            {/* Finance Admin */}
            <div className="p-4 border rounded-lg bg-emerald-50 border-emerald-200">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold">Finance Admin</span>
                <Badge variant="secondary">
                  {loading ? "..." : getRoleCount("finance_admin")} assigned
                </Badge>
              </div>
            </div>

            {/* Support Admin */}
            <div className="p-4 border rounded-lg bg-rose-50 border-rose-200">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-rose-600" />
                <span className="font-semibold">Support Admin</span>
                <Badge variant="secondary">
                  {loading ? "..." : getRoleCount("support_admin")} assigned
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Assign roles from Roles & Permissions page
      </p>
    </div>
  );
}
