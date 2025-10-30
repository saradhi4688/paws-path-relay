import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Users, Package, Home, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Admin = () => {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalRiders: 0,
    totalShelters: 0,
    totalDonations: 0,
    pendingDonations: 0,
    deliveredDonations: 0,
  });
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!userRole) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      loadStats();
      loadRecentDonations();
    };
    checkAuth();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("admin-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        () => {
          loadStats();
          loadRecentDonations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const loadStats = async () => {
    // Load role counts
    const { data: roles } = await supabase.from("user_roles").select("role");

    const donors = roles?.filter((r) => r.role === "donor").length || 0;
    const riders = roles?.filter((r) => r.role === "rider").length || 0;
    const shelters = roles?.filter((r) => r.role === "shelter").length || 0;

    // Load donation stats
    const { data: donations } = await supabase.from("donations").select("status");

    const total = donations?.length || 0;
    const pending = donations?.filter((d) => d.status === "pending").length || 0;
    const delivered = donations?.filter((d) => d.status === "delivered").length || 0;

    setStats({
      totalDonors: donors,
      totalRiders: riders,
      totalShelters: shelters,
      totalDonations: total,
      pendingDonations: pending,
      deliveredDonations: delivered,
    });
  };

  const loadRecentDonations = async () => {
    const { data, error } = await supabase
      .from("donations")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setRecentDonations(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Link to="/analytics">
              <Button variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm">Donors</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.totalDonors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="text-sm">Riders</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.totalRiders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-secondary" />
                    <span className="text-sm">Shelters</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.totalShelters}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardDescription>Total Donations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">{stats.totalDonations}</div>
                <p className="text-sm text-muted-foreground">Food donations created</p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardDescription>Donation Status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending</span>
                  <span className="text-2xl font-bold text-secondary">{stats.pendingDonations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Delivered</span>
                  <span className="text-2xl font-bold text-primary">{stats.deliveredDonations}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Recent Donations
            </CardTitle>
            <CardDescription>Latest food donation activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {recentDonations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No donations yet</p>
              ) : (
                recentDonations.map((donation) => (
                  <Card key={donation.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{donation.food_type}</h3>
                        <p className="text-sm text-muted-foreground">
                          Donor: {donation.profiles?.full_name || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">{donation.quantity}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          donation.status === "pending"
                            ? "bg-secondary/20 text-secondary-foreground"
                            : donation.status === "delivered"
                            ? "bg-primary/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {donation.status}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
