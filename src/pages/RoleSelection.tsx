import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Bike, Home, ShieldCheck } from "lucide-react";

const roles = [
  { id: "donor", name: "Food Donor", icon: User, description: "Donate surplus food to help pets" },
  { id: "rider", name: "Rider", icon: Bike, description: "Deliver food donations to shelters" },
  { id: "shelter", name: "Pet Shelter", icon: Home, description: "Receive food for your shelter" },
  { id: "admin", name: "Administrator", icon: ShieldCheck, description: "Manage the platform" },
];

const RoleSelection = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);

      // Check if user already has a role
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (userRoles) {
        navigateToRolePage(userRoles.role);
      }
    };
    getUser();
  }, [navigate]);

  const navigateToRolePage = (role: string) => {
    const routes = {
      donor: "/donor",
      rider: "/rider",
      shelter: "/shelter",
      admin: "/admin",
    };
    navigate(routes[role as keyof typeof routes] || "/");
  };

  const handleRoleSelection = async () => {
    if (!selectedRole || !userId) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role: selectedRole as any }]);

      if (error) throw error;

      toast.success("Role selected successfully!");
      navigateToRolePage(selectedRole);
    } catch (error: any) {
      toast.error(error.message || "Failed to set role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-4xl space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Choose Your Role
          </h1>
          <p className="text-muted-foreground">Select how you'd like to contribute to PetSustain</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-glow ${
                  selectedRole === role.id ? "ring-2 ring-primary shadow-glow" : ""
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{role.name}</CardTitle>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            size="lg"
            variant="hero"
            className="min-w-[200px]"
          >
            {loading ? "Setting up..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
