import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MapViewer } from "@/components/MapViewer";
import { LogOut, MapPin, Package } from "lucide-react";

const Rider = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      loadDonations();
    };
    checkAuth();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("donations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        () => {
          loadDonations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const loadDonations = async () => {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .in("status", ["pending", "assigned"])
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDonations(data);
    }
  };

  const handleAcceptOrder = async (donationId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("donations")
        .update({ rider_id: userId, status: "assigned" })
        .eq("id", donationId);

      if (error) throw error;

      toast.success("Order accepted! Please pick up the donation.");
      loadDonations();
    } catch (error: any) {
      toast.error(error.message || "Failed to accept order");
    }
  };

  const handleQualityCheck = async (donationId: string, quality: "approved" | "bio_waste") => {
    try {
      const { error } = await supabase
        .from("donations")
        .update({
          quality_check: quality,
          status: quality === "approved" ? "picked_up" : "rejected",
        })
        .eq("id", donationId);

      if (error) throw error;

      toast.success(
        quality === "approved"
          ? "Food approved! Deliver to shelter."
          : "Food marked for bio waste disposal."
      );
      loadDonations();
    } catch (error: any) {
      toast.error(error.message || "Failed to update quality check");
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
          <h1 className="text-3xl font-bold">Rider Dashboard</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Nearby Orders
              </CardTitle>
              <CardDescription>Food donations awaiting pickup within 50km</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] rounded-lg overflow-hidden border">
                <MapViewer donations={donations} onDonationClick={setSelectedDonation} />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Available Orders
              </CardTitle>
              <CardDescription>Accept and manage donations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {donations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No pending orders at the moment
                  </p>
                ) : (
                  donations.map((donation) => (
                    <Card key={donation.id} className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold">{donation.food_type}</h3>
                          <p className="text-sm text-muted-foreground">{donation.quantity}</p>
                          <p className="text-sm mt-1">{donation.description}</p>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">Pickup Location:</p>
                          <p className="text-muted-foreground">{donation.address}</p>
                        </div>
                        {donation.rider_id === userId ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-primary">Assigned to you</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleQualityCheck(donation.id, "approved")}
                                variant="default"
                              >
                                Approve Food
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleQualityCheck(donation.id, "bio_waste")}
                                variant="destructive"
                              >
                                Bio Waste
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptOrder(donation.id)}
                            variant="hero"
                          >
                            Accept Order
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Rider;
