import {
  BriefcaseIcon,
  ArrowRight,
  Building2,
  Search,
  Shield,
  Star,
  Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-primary text-white">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BriefcaseIcon className="h-8 w-8" />
            <span className="text-2xl font-bold">Aguka</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#how-it-works" className="hover:text-blue-100">
              How it works
            </a>
            <a href="#for-companies" className="hover:text-blue-100">
              For Companies
            </a>
            <a href="#for-talent" className="hover:text-blue-100">
              For Talent
            </a>
          </div>
          <div className="flex space-x-4">
            <Button variant="ghost" className="text-white hover:text-blue-100">
              Sign in
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/employer-signup")}
            >
              Join Now
            </Button>
          </div>
        </nav>

        {/* Rest of the HomePage content remains the same as in the previous App.tsx */}
        {/* ... */}
      </header>
      {/* Hero Section */}
      <div className="pt-24 pb-16 sm:pt-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                Connect with Top Talent and
                <span className="text-primary"> Dream Opportunities</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                Aguka matches exceptional talent with leading companies, making
                job search and hiring efficient, transparent, and successful.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-[#006097]">
                  Find Talent
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline">
                  Find Work
                  <Search className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80"
                alt="Professional meeting"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">98%</div>
              <div className="mt-2 text-gray-600">Successful Placements</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">14,000+</div>
              <div className="mt-2 text-gray-600">Matched Professionals</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">2,500+</div>
              <div className="mt-2 text-gray-600">Partner Companies</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Aguka?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Vetted Talent</h3>
              <p className="text-gray-600">
                We thoroughly screen all candidates to ensure only the best
                talent joins our platform.
              </p>
            </Card>
            <Card className="p-6">
              <Users2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Our AI-powered system matches candidates with the perfect
                opportunities.
              </p>
            </Card>
            <Card className="p-6">
              <Building2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Top Companies</h3>
              <p className="text-gray-600">
                Partner with leading companies offering competitive
                opportunities.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Success Stories
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-gray-600 mb-4">
                "Aguka helped me find my dream job within weeks. The process was
                smooth and professional."
              </p>
              <div className="flex items-center">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80"
                  alt="Sarah Johnson"
                  className="h-12 w-12 rounded-full"
                />
                <div className="ml-4">
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-sm text-gray-500">Software Engineer</div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-gray-600 mb-4">
                "As an employer, Aguka has transformed our hiring process. We've
                found exceptional talent quickly."
              </p>
              <div className="flex items-center">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80"
                  alt="John Smith"
                  className="h-12 w-12 rounded-full"
                />
                <div className="ml-4">
                  <div className="font-semibold">John Smith</div>
                  <div className="text-sm text-gray-500">HR Director</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Career or Hiring Process?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals and companies who have already
              discovered the Aguka advantage.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary">
                Hire Talent
              </Button>
              <Button size="lg" variant="secondary">
                Find Work
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <span className="text-2xl font-bold">Aguka</span>
              </div>
              <p className="mt-4 text-gray-400">
                Connecting talent with opportunity in the digital age.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Talent</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Career Resources
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Hiring Solutions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Enterprise
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Case Studies
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Aguka. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
