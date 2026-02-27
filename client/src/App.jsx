import { useState, useEffect } from 'react';
import {
  MenuOutlined,
  RobotOutlined,
  FilePdfOutlined,
  GoogleOutlined,
  TrophyOutlined,
  BarChartOutlined,
  SafetyOutlined,
  DashboardOutlined,
  ClockCircleOutlined,
  MoonOutlined,
  SunOutlined
} from '@ant-design/icons';
import { Button, Tag, Avatar } from 'antd';
import {
  Brain,
  Zap,
  Users,
  Clock,
  ChevronRight,
  Star,
} from 'lucide-react';
import FullLogolight from './assets/FullLogolight.png';
import { useNavigate } from 'react-router-dom';
import fastapilogo from './assets/fastapilogo.png';
import nodejslogo from './assets/nodejslogo.png';
import reactlogo from './assets/reactlogo.png';
import mongodblogo from './assets/mongodblogo.png';
import { useThemeStore } from './store/themeStore.js';
import PricingComponent from './Components/PricingComponent.jsx';


const App = () => {
  const { darkMode, toggleDarkMode } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <RobotOutlined className="text-3xl" style={{ color: 'var(--color-ai)' }} />,
      title: "AI Exercise Generator",
      description: "Create questions from course materials (PDF/DOCX → Markdown) with intelligent verification",
      tag: "AI-Powered"
    },
    {
      icon: <DashboardOutlined className="text-3xl text-primary" />,
      title: "Role-Based Dashboards",
      description: "Personalized interfaces for students, teachers, and admins with real-time updates",
      tag: "User-Centric"
    },
    {
      icon: <TrophyOutlined className="text-3xl text-warning" />,
      title: "Contests & Leaderboards",
      description: "Engage students with timed quizzes, rankings, and competitive learning experiences",
      tag: "Gamification"
    },
    {
      icon: <GoogleOutlined className="text-3xl" style={{ color: '#4285F4' }} />,
      title: "Google Drive Integration",
      description: "Seamlessly sync and import course materials directly from Google Drive",
      tag: "Integration"
    },
    {
      icon: <BarChartOutlined className="text-3xl text-success" />,
      title: "Advanced Analytics",
      description: "Track student performance, identify trends, and measure learning outcomes",
      tag: "Insights"
    },
    {
      icon: <SafetyOutlined className="text-3xl text-info" />,
      title: "Secure Authentication",
      description: "JWT-based role access with enterprise-grade security for all users",
      tag: "Security"
    }
  ];

  const benefits = [
    {
      icon: <Zap className="w-6 h-6 text-warning" />,
      title: "70% Faster",
      description: "Reduce assessment creation time"
    },
    {
      icon: <Brain className="w-6 h-6 text-ai" />,
      title: "AI-Powered",
      description: "Smart grading and feedback"
    },
    {
      icon: <Users className="w-6 h-6 text-success" />,
      title: "10x Engagement",
      description: "Increase student participation"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Upload Course Materials",
      description: "Teachers upload PDF/DOCX files or sync from Google Drive",
      icon: <FilePdfOutlined className="text-2xl text-primary" />
    },
    {
      step: "02",
      title: "AI Generates Content",
      description: "Automatic conversion to Markdown with intelligent exercise creation",
      icon: <RobotOutlined className="text-2xl text-ai" />
    },
    {
      step: "03",
      title: "Review & Schedule",
      description: "Teachers verify AI-generated content and set deadlines",
      icon: <ClockCircleOutlined className="text-2xl text-warning" />
    },
    {
      step: "04",
      title: "Students Engage",
      description: "Interactive learning with contests, leaderboards, and real-time feedback",
      icon: <TrophyOutlined className="text-2xl text-success" />
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Physics Professor",
      content: "ExamFlow AI has revolutionized how I create assessments. The AI-generated questions are accurate and save me hours each week.",
      avatar: "SJ",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Computer Science Student",
      content: "The contest mode and leaderboards make learning fun. I actually look forward to taking quizzes now!",
      avatar: "MC",
      rating: 5
    },
    {
      name: "Prof. Emily Rodriguez",
      role: "Mathematics Department",
      content: "The analytics help me identify struggling students early. It's transformed my teaching approach.",
      avatar: "ER",
      rating: 5
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "50K+", label: "Exams Created" },
    { value: "95%", label: "Satisfaction Rate" },
    { value: "24/7", label: "AI Support" }
  ];

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
  ];


  const Logo = () => {
    if (darkMode) {
      return <img src={FullLogolight} alt="ExamFlow AI" className="h-30 w-auto"
        style={
          { filter: 'invert(1) brightness(1.1)' }
        } />
    }
    return <img src={FullLogolight} alt="ExamFlow AI" className="h-30 w-auto" />
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-surface/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center align-center space-x-2">
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleDarkMode()}
                className="p-2 rounded-lg hover:bg-surface-alt transition-colors"
              >
                {darkMode ? <SunOutlined className="text-warning" /> : <MoonOutlined />}
              </button>

              <Button
                type="primary"
                className="hidden md:inline-flex bg-primary hover:bg-primary-hover border-none"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-surface-alt"
              >
                <MenuOutlined />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-text-secondary hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <Button type="primary" block className="mt-4 bg-primary hover:bg-primary-hover border-none">
                Get Started
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Smart Learning,{' '}
                <span className="text-primary">Smarter Assessment</span>
              </h1>

              <p className="text-lg text-text-secondary mb-8">
                ExamFlow AI is an intelligent platform for educators and students that simplifies
                exam scheduling, homework management, and automated exercise generation.
              </p>

              {/* Benefits Pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-surface-alt px-4 py-2 rounded-full">
                    {benefit.icon}
                    <div>
                      <span className="font-semibold">{benefit.title}</span>
                      <span className="text-text-secondary text-sm ml-2">{benefit.description}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-12">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-text-secondary">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Hero Image/Illustration */}
            <div className="relative">
              <div className="bg-linear-to-br from-primary/20 to-ai/20 rounded-3xl p-8">
                <div className="bg-surface rounded-2xl shadow-xl p-6">
                  {/* Dashboard Preview */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Today's Schedule</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-surface-alt rounded-lg">
                        <Clock className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">Advanced Mathematics</div>
                          <div className="text-sm text-text-secondary">Quiz · 30 minutes</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-surface-alt rounded-lg">
                        <Brain className="w-5 h-5 text-ai" />
                        <div className="flex-1">
                          <div className="font-medium">AI-Generated Exercise</div>
                          <div className="text-sm text-text-secondary">Physics · Due in 2h</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-surface-alt rounded-lg">
                        <TrophyOutlined className="w-5 h-5 text-warning" />
                        <div className="flex-1">
                          <div className="font-medium">Weekly Contest</div>
                          <div className="text-sm text-text-secondary">Leaderboard active</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Class Progress</span>
                        <span className="text-primary">78%</span>
                      </div>
                      <div className="w-full bg-surface-alt rounded-full h-2">
                        <div className="bg-primary rounded-full h-2" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-ai/30 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/30 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need for{' '}
              <span className="text-primary">Modern Education</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              Powered by cutting-edge AI to transform traditional learning into an engaging,
              efficient experience for teachers and students alike.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-bg rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border"
              >
                <div className="w-12 h-12 bg-surface-alt rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <Tag color={feature.tag === "AI-Powered" ? "purple" : "blue"} style={{ background: "none", textShadow: "0px 0px 5px blue" }}>{feature.tag}</Tag>
                </div>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Simple <span className="text-primary">4-Step</span> Workflow
            </h2>
            <p className="text-text-secondary text-lg">
              From upload to engagement - see how ExamFlow AI streamlines the entire process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-surface-alt rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="text-2xl font-bold text-primary/30 mb-2">{step.step}</div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-text-secondary text-sm">{step.description}</p>
                </div>
                {index < 3 && (
                  <ChevronRight className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 text-text-muted" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Built with <span className="text-primary">Modern Technology</span>
            </h2>
            <p className="text-text-secondary text-lg">
              Enterprise-grade stack ensuring scalability, security, and performance
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-25 h-25 mx-auto mb-3 bg-bg rounded-xl flex items-center justify-center border border-border">
                <img src={reactlogo} alt="React" className="w-20 h-20" />
              </div>
              <p className="font-semibold">React + Vite</p>
              <p className="text-xs text-text-secondary">Frontend</p>
            </div>
            <div className="text-center">
              <div className="w-25 h-25 mx-auto mb-3 bg-bg rounded-xl flex items-center justify-center border border-border">
                <img src={nodejslogo} alt="Node.js" className="w-20 h-20" />
              </div>
              <p className="font-semibold">Node.js</p>
              <p className="text-xs text-text-secondary">Backend</p>
            </div>
            <div className="text-center">
              <div className="w-25 h-25 mx-auto mb-3 bg-bg rounded-xl flex items-center justify-center border border-border">
                <img src={fastapilogo} alt="FastAPI" className="w-20 h-20" />
              </div>
              <p className="font-semibold">Python + FastAPI</p>
              <p className="text-xs text-text-secondary">AI Services</p>
            </div>
            <div className="text-center">
              <div className="w-25 h-25 mx-auto mb-3 bg-bg rounded-xl flex items-center justify-center border border-border">
                <img src={mongodblogo} alt="MongoDB" className="w-20 h-20" />
              </div>
              <p className="font-semibold">MongoDB + Redis</p>
              <p className="text-xs text-text-secondary">Database</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Tag color="blue" style={{ background: "none", textShadow: "0px 0px 5px blue" }}>Docker</Tag>
            <Tag color="purple" style={{ background: "none", textShadow: "0px 0px 5px purple" }}>LangChain</Tag>
            <Tag color="green" style={{ background: "none", textShadow: "0px 0px 5px green" }}>WebSocket</Tag>
            <Tag color="orange" style={{ background: "none", textShadow: "0px 0px 5px orange" }}>JWT</Tag>
            <Tag color="cyan" style={{ background: "none", textShadow: "0px 0px 5px cyan" }}>Google Drive API</Tag>
            <Tag color="magenta" style={{ background: "none", textShadow: "0px 0px 5px magenta" }}>GitHub Actions</Tag>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Loved by <span className="text-primary">Educators & Students</span>
            </h2>
            <p className="text-text-secondary text-lg">
              Join thousands of satisfied users transforming their learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-surface rounded-2xl p-6 border border-border">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-text-secondary mb-6">"{testimonial.content}"</p>
                <div className="flex items-center bg-surface-alt rounded-lg p-3">
                  <Avatar className="bg-primary">{testimonial.avatar}</Avatar>
                  <div className='ml-3'>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-text-secondary">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      { /* Pricing */}
      <div id='pricing'>
        <PricingComponent />
      </div>



      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center align-center space-x-2">
                <Logo />
              </div>
              <p className="text-text-secondary text-sm text-center">
                Smart Learning, Smarter Assessment
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-text-secondary">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">Integrations</a></li>
                <li><a href="#" className="hover:text-primary">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-text-secondary">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Careers</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-text-secondary">
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-primary">Terms</a></li>
                <li><a href="#" className="hover:text-primary">Security</a></li>
                <li><a href="#" className="hover:text-primary">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-text-secondary text-sm">
            <p>&copy; 2026 ExamFlow AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;