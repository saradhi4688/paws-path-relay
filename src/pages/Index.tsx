import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Heart, Leaf, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  PetSustain
                </span>
                <br />
                Fighting Food Waste, Feeding Pets
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Connect food donors with pet shelters through our network of dedicated riders. 
                Turn surplus food into nutrition for pets in need.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth">
                  <Button size="lg" variant="hero" className="text-lg px-8">
                    Get Started
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Hands holding fresh food with happy pets"
                className="relative rounded-3xl shadow-glow w-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to make a difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="animate-fade-in-up border-primary/20 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>1. Donate Food</CardTitle>
                <CardDescription>
                  Share surplus food by creating a donation listing with location details
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="animate-fade-in-up border-secondary/20 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>2. Rider Pickup</CardTitle>
                <CardDescription>
                  Our riders collect and quality-check the food, ensuring it's safe for pets
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="animate-fade-in-up border-accent/20 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>3. Deliver to Shelters</CardTitle>
                <CardDescription>
                  Food reaches pet shelters where it nourishes animals in need
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold">Our Impact</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Together, we're making a real difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center animate-scale-in">
              <CardContent className="pt-8">
                <div className="text-5xl font-bold text-primary mb-2">5K+</div>
                <p className="text-muted-foreground">Meals Delivered</p>
              </CardContent>
            </Card>

            <Card className="text-center animate-scale-in">
              <CardContent className="pt-8">
                <div className="text-5xl font-bold text-secondary mb-2">50+</div>
                <p className="text-muted-foreground">Partner Shelters</p>
              </CardContent>
            </Card>

            <Card className="text-center animate-scale-in">
              <CardContent className="pt-8">
                <div className="text-5xl font-bold text-accent mb-2">3K+</div>
                <p className="text-muted-foreground">Pets Fed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our community of donors, riders, and shelters working together 
            to reduce food waste and help pets in need.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="hero" className="text-lg px-12 animate-pulse-glow">
              Join PetSustain Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 PetSustain. Fighting food waste, one meal at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
