import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  Users,
  Globe,
  DollarSign,
  Video,
  BarChart3,
  Award,
  CheckCircle,
  FileText,
  ArrowRight,
  PlayCircle,
  Clock,
  TrendingUp,
  Star,
  Shield,
  Zap
} from "lucide-react";

const Teach = () => {
  const navigate = useNavigate();
  const { user, addInstructorRole } = useAuth();

  // Check if user is already an instructor
  useEffect(() => {
    if (user?.roles?.includes('instructor')) {
      toast("You are already registered as an instructor!", { 
        icon: "ℹ️" 
      });
      navigate("/instructor/dashboard");
    }
  }, [user, navigate]);

  const handleGetStarted = async () => {
    if (user) {
      // User is logged in but not instructor
      if (!user.roles?.includes('instructor')) {
        try {
          // Add instructor role to existing user
          const success = await addInstructorRole();
          if (success) {
            toast.success("Congratulations! You are now an instructor!");
            navigate("/instructor/dashboard");
          }
        } catch (error) {
          toast.error("Failed to upgrade to instructor");
        }
      }
    } else {
      // Not logged in - redirect to register with instructor role
      localStorage.setItem("instructorIntent", "true");
      toast.success("Create an account to become an instructor!");
      navigate("/register", { 
        state: { 
          role: "instructor", 
          from: "/teach" 
        } 
      });
    }
  };

  const stats = [
    { icon: Users, value: "12,000+", label: "Active Students" },
    { icon: Globe, value: "50+", label: "Countries" },
    { icon: DollarSign, value: "$5K+", label: "Average Monthly Earnings" },
    { icon: BarChart3, value: "85%", label: "Revenue Share" }
  ];

  const benefits = [
    {
      icon: Users,
      title: "Ready-to-Teach Audience",
      description: "Access 12,000+ motivated learners actively looking for courses in your expertise area."
    },
    {
      icon: TrendingUp,
      title: "Higher Revenue Share",
      description: "Earn up to 85% revenue share on your courses. No hidden fees, no exclusivity lock-in."
    },
    {
      icon: Video,
      title: "Production Support",
      description: "Professional video editing, thumbnails, and course structure consultation included."
    },
    {
      icon: Award,
      title: "Verified Instructor Badge",
      description: "Build trust with students through our verified instructor program."
    },
    {
      icon: Clock,
      title: "Fast-Track Approval",
      description: "Get reviewed within 48 hours and start teaching within a week."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Your courses automatically translated into 5+ languages with AI."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Get paid reliably and on time, every month via PayPal, bank transfer, or wire."
    },
    {
      icon: Zap,
      title: "AI-Powered Tools",
      description: "Create quizzes, transcripts, and captions automatically with our AI suite."
    },
    {
      icon: Star,
      title: "Quality Recognition",
      description: "Top-rated instructors get featured on our homepage and newsletter."
    }
  ];

  const successStories = [
    {
      name: "Priya Sharma",
      role: "Data Science Instructor",
      students: "8,500+",
      earnings: "$30,000 in 3 months",
      image: "https://i.pravatar.cc/150?img=1"
    },
    {
      name: "Rahul Verma",
      role: "Web Development Instructor",
      students: "12,000+",
      earnings: "$80,000 in 6 months",
      image: "https://i.pravatar.cc/150?img=3"
    },
    {
      name: "Michael Chen",
      role: "AI & Machine Learning",
      students: "15,000+",
      earnings: "$120,000 in 8 months",
      image: "https://i.pravatar.cc/150?img=8"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Account",
      description: "Sign up as an instructor in just 2 minutes. No credit card required."
    },
    {
      step: "2",
      title: "Get Approved",
      description: "Our team reviews your profile within 48 hours. We'll guide you through the process."
    },
    {
      step: "3",
      title: "Create Your Course",
      description: "Use our course builder to create engaging content. We provide production support!"
    },
    {
      step: "4",
      title: "Start Earning",
      description: "Publish your course and start earning up to 85% revenue share from day one."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-24 lg:py-32">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-6 border border-white/20">
                🎓 JOIN OUR INSTRUCTOR COMMUNITY
              </span>
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Turn Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                  Expertise into Income
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-lg">
                Share your knowledge with thousands of eager learners. 
                We handle the platform, you focus on teaching.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  Become an Instructor <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-6 mt-8 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" /> No setup fee
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Lifetime earnings
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" /> 24/7 support
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop"
                  alt="Instructor teaching"
                  className="w-full h-auto transform hover:scale-105 transition duration-700"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/800x600/8B5CF6/white?text=Teach+on+LearnLab";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              </div>
              
              {/* Floating stats card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">1,200+</p>
                    <p className="text-gray-600 text-sm">Active Instructors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex p-3 bg-purple-100 rounded-full mb-3">
                  <stat.icon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Simple Process
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Start Teaching in 4 Easy Steps
            </h2>
            <p className="text-xl text-gray-600">
              From signup to your first paycheck, we're with you every step of the way
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 text-gray-300">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY TEACH HERE */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Teach on <span className="text-primary">LearnLab?</span>
            </h2>
            <p className="text-xl text-gray-600">
              We provide everything you need to create, market, and sell your courses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100 group">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl w-fit group-hover:scale-110 transition">
                  <benefit.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Success Stories
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Instructors Like You, Thriving
            </h2>
            <p className="text-xl text-gray-600">
              Join hundreds of educators who've found their community and income on LearnLab
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100 flex gap-6 items-start hover:shadow-lg transition">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${story.name.split(' ').join('+')}&size=80&background=8B5CF6&color=fff`;
                  }}
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{story.name}</h3>
                  <p className="text-primary font-medium mb-3">{story.role}</p>
                  <div className="flex flex-col gap-2 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" /> {story.students} students
                    </span>
                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                      <DollarSign className="w-4 h-4" /> {story.earnings}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EARNING POTENTIAL */}
      <section className="py-20 bg-gradient-to-r from-primary to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-6">
                💰 EARNING POTENTIAL
              </span>
              <h2 className="text-4xl font-bold mb-6">
                How Much Can You Earn?
              </h2>
              <p className="text-xl text-purple-100 mb-8">
                Our top instructors make over $10,000 per month. You keep up to 85% of every sale.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span>$50+ average course price</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span>85% revenue share on self-sales</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span>50% revenue share on platform sales</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span>Monthly payouts via PayPal, bank transfer, or Payoneer</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="text-3xl font-bold">$2.5M+</div>
                <div className="text-purple-200">paid to instructors last year</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6">Revenue Calculator</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Course price</span>
                    <span className="font-bold">$50</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Your earnings per sale</span>
                    <span className="font-bold">$42.50</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>100 students</span>
                    <span className="font-bold">$4,250</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>500 students</span>
                    <span className="font-bold">$21,250</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>1,000 students</span>
                    <span className="font-bold text-yellow-400">$42,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Do I need teaching experience?",
                a: "Not necessarily! We value expertise in your field and passion for teaching. We provide resources to help you structure and deliver your first course."
              },
              {
                q: "How much can I earn?",
                a: "Top instructors earn over $10,000 per month. Your earnings depend on course quality, pricing, and marketing. You keep up to 85% of revenue."
              },
              {
                q: "What topics can I teach?",
                a: "We focus on professional skills: Technology, Business, Design, Marketing, Data Science, AI, and Personal Development. If you're unsure, just apply and we'll discuss."
              },
              {
                q: "How long does approval take?",
                a: "Most applications are reviewed within 48 hours. You'll hear from us either way!"
              },
              {
                q: "Do I need to create all course content myself?",
                a: "We provide production support including video editing, thumbnail design, and course structure consultation to help you create high-quality content."
              },
              {
                q: "How do I get paid?",
                a: "We pay monthly via PayPal, bank transfer, or Payoneer. You can withdraw your earnings once they reach $50."
              }
            ].map((faq, index) => (
              <div key={index} className="border border-gray-100 rounded-xl p-6 hover:bg-gray-50 transition">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Share Your Knowledge?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join 1,200+ instructors already teaching on LearnLab. Start your journey today.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-yellow-600 transition shadow-lg inline-flex items-center gap-2"
          >
            Get Started Now <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-gray-400 mt-4">
            No credit card required. Free to join.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Teach;