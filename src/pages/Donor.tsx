import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MapPicker } from "@/components/MapPicker";
import { LogOut, Plus } from "lucide-react";

const Donor = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      loadDonations(user.id);
    };
    checkAuth();
  }, [navigate]);

  const loadDonations = async (uid: string) => {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("donor_id", uid)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDonations(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !position) {
      toast.error("Please select a location on the map");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("donations").insert({
        donor_id: userId,
        food_type: foodType,
        quantity,
        description,
        address,
        latitude: position[0],
        longitude: position[1],
        status: "pending",
      });

      if (error) throw error;

      toast.success("Donation created successfully!");
      setFoodType("");
      setQuantity("");
      setDescription("");
      setAddress("");
      setPosition(null);
      loadDonations(userId);
    } catch (error: any) {
      toast.error(error.message || "Failed to create donation");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold">Donor Dashboard</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Donation
              </CardTitle>
              <CardDescription>Share your surplus food with pets in need</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="foodType">Food Type</Label>
                  <Input
                    id="foodType"
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    placeholder="e.g., Cooked rice, vegetables"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g., 2 kg, 5 containers"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Additional details about the food"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Pickup Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City"
                    required
                  />
                </div>
                <div>
                  <Label>Select Location on Map</Label>
                  <div className="h-[300px] rounded-lg overflow-hidden border mt-2">
                    <MapPicker position={position} setPosition={setPosition} />
                  </div>
                </div>
                <Button type="submit" disabled={loading} variant="hero" className="w-full">
                  {loading ? "Creating..." : "Create Donation"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>My Donations</CardTitle>
              <CardDescription>Track your food donations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {donations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No donations yet</p>
                ) : (
                  donations.map((donation) => (
                    <Card key={donation.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold">{donation.food_type}</h3>
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
                        <p className="text-sm text-muted-foreground">{donation.quantity}</p>
                        <p className="text-sm">{donation.description}</p>
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

export default Donor;
