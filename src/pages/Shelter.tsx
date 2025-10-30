import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LogOut, Home, Package } from "lucide-react";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LocationMarker = ({ position, setPosition }: any) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const Shelter = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [shelter, setShelter] = useState<any>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [capacity, setCapacity] = useState("");
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
      loadShelter(user.id);
    };
    checkAuth();
  }, [navigate]);

  const loadShelter = async (uid: string) => {
    const { data, error } = await supabase
      .from("shelters")
      .select("*")
      .eq("user_id", uid)
      .single();

    if (data) {
      setShelter(data);
      loadDonations(data.id);
    } else {
      setShowSetup(true);
    }
  };

  const loadDonations = async (shelterId: string) => {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("shelter_id", shelterId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDonations(data);
    }
  };

  const handleSetupShelter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !position) {
      toast.error("Please select a location on the map");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shelters")
        .insert([{
          user_id: userId,
          name,
          address,
          phone,
          capacity: parseInt(capacity),
          latitude: position[0],
          longitude: position[1],
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Shelter registered successfully!");
      setShelter(data);
      setShowSetup(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to register shelter");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Register Your Shelter
              </CardTitle>
              <CardDescription>Set up your shelter profile to receive donations</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetupShelter} className="space-y-4">
                <div>
                  <Label htmlFor="name">Shelter Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Happy Paws Shelter"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Pet Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="50"
                    required
                  />
                </div>
                <div>
                  <Label>Select Location on Map</Label>
                  <div className="h-[300px] rounded-lg overflow-hidden border mt-2">
                    <MapContainer
                      center={[51.505, -0.09]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                  </div>
                </div>
                <Button type="submit" disabled={loading} variant="hero" className="w-full">
                  {loading ? "Registering..." : "Register Shelter"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Shelter Dashboard</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Shelter Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shelter && (
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">{shelter.name}</p>
                    <p className="text-sm text-muted-foreground">{shelter.address}</p>
                  </div>
                  {shelter.phone && (
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{shelter.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">Capacity</p>
                    <p className="text-sm text-muted-foreground">{shelter.capacity} pets</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Received Donations
              </CardTitle>
              <CardDescription>Track incoming food donations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
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
                              donation.status === "delivered"
                                ? "bg-primary/20 text-primary-foreground"
                                : "bg-secondary/20 text-secondary-foreground"
                            }`}
                          >
                            {donation.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{donation.quantity}</p>
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

export default Shelter;
