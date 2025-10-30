import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444"];

const Analytics = () => {
  const [donationsByStatus, setDonationsByStatus] = useState<any[]>([]);
  const [donationsByMonth, setDonationsByMonth] = useState<any[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      loadAnalytics();
    };
    checkAuth();
  }, [navigate]);

  const loadAnalytics = async () => {
    // Load donations by status
    const { data: donations } = await supabase.from("donations").select("status, created_at");

    if (donations) {
      const statusCounts = donations.reduce((acc: any, donation) => {
        acc[donation.status] = (acc[donation.status] || 0) + 1;
        return acc;
      }, {});

      const statusData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
      setDonationsByStatus(statusData);

      // Group by month
      const monthCounts = donations.reduce((acc: any, donation) => {
        const month = new Date(donation.created_at).toLocaleDateString("en-US", {
          month: "short",
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const monthData = Object.entries(monthCounts).map(([name, donations]) => ({
        name,
        donations,
      }));
      setDonationsByMonth(monthData);
    }

    // Load role distribution
    const { data: roles } = await supabase.from("user_roles").select("role");

    if (roles) {
      const roleCounts = roles.reduce((acc: any, { role }) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const roleData = Object.entries(roleCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
      setRoleDistribution(roleData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Donations by Status</CardTitle>
              <CardDescription>Current status distribution of all donations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={donationsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {donationsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>User Role Distribution</CardTitle>
              <CardDescription>Platform users by role type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roleDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill="#10b981"
                    name="Users"
                    animationBegin={0}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 animate-fade-in">
            <CardHeader>
              <CardTitle>Donations Over Time</CardTitle>
              <CardDescription>Monthly donation trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={donationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="donations"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                    animationBegin={0}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
