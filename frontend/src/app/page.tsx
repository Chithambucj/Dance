import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Share2, Sparkles, MapPin, Phone, Mail, CheckCircle2, Send } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans scroll-smooth bg-white text-gray-900">
      {/* Navbar */}
      <header className="px-4 lg:px-12 h-20 flex items-center bg-white sticky top-0 z-50 border-b border-gray-100">
        <Link className="flex items-center gap-2 group w-fit" href="/">
          <div className="w-8 h-8 flex items-center justify-center text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
          </div>
          <span className="font-bold text-xl text-primary tracking-tight">
            StepUp
          </span>
        </Link>

        <nav className="hidden lg:flex ml-12 gap-8 items-center flex-1 justify-center">
          <Link className="text-sm font-semibold text-gray-900" href="#home">Home</Link>
          <Link className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#about">About</Link>
          <Link className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#classes">Classes</Link>
          <Link className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#instructors">Instructors</Link>
          <Link className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#gallery">Gallery</Link>
          <Link className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#pricing">Pricing</Link>
          <Link className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#contact">Contact</Link>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" className="rounded-full px-6 border-primary text-primary hover:bg-primary/5 font-semibold">
              Login
            </Button>
          </Link>
          <Link href="/login">
            <Button className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white font-semibold">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="w-full relative overflow-hidden py-12 lg:py-20 bg-gray-50/30">
          <div className="container px-4 md:px-6 lg:px-12 mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6 text-center lg:text-left z-20">
              <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1.5 text-sm font-semibold text-pink-600">
                <Sparkles className="w-4 h-4" />
                <span>Move • Groove • Inspire</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Dance Your Way <br />
                <span className="text-primary">to a Better You</span>
              </h1>

              <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 font-medium">
                Join our expert-led dance classes and discover the joy of movement in a fun and energetic environment.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <Link href="#classes">
                  <Button className="rounded-full h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all w-full sm:w-auto">
                    Explore Classes
                  </Button>
                </Link>
                <Link href="#contact">
                  <Button variant="outline" className="rounded-full h-14 px-8 text-lg border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 w-full sm:w-auto font-semibold">
                    <PlayCircle className="w-5 h-5 text-primary" />
                    Book a Trial Class
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image area - we use a placeholder or stock image of a dancer */}
            <div className="lg:w-1/2 relative flex justify-center z-10">
              <div className="relative w-full max-w-lg aspect-[4/5]">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-300 rounded-full blur-[100px] opacity-60" />
                <div 
                  className="absolute inset-0 bg-[url('/images/hero-dancer.jpg')] bg-cover bg-center rounded-3xl z-10 shadow-2xl"
                  style={{
                    clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="container px-4 md:px-6 lg:px-12 mx-auto relative z-20 mt-16">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-wrap justify-between items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-900">10+</h4>
                  <p className="text-sm text-gray-500 font-medium">Dance Styles</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center text-pink-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-900">25+</h4>
                  <p className="text-sm text-gray-500 font-medium">Expert Instructors</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-900">500+</h4>
                  <p className="text-sm text-gray-500 font-medium">Happy Students</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center text-indigo-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-900">15+</h4>
                  <p className="text-sm text-gray-500 font-medium">Years of Experience</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full py-24 bg-gray-50/50 border-t border-gray-100">
          <div className="container px-4 md:px-6 lg:px-12 mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1.5 text-xs font-bold text-pink-600 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>About StepUp Dance Studio</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                  Where Passion Meets <span className="text-primary">Purpose & Rhythm</span>
                </h2>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed font-medium">
                  Founded in 2009, StepUp Dance Studio began as a small classroom with a big dream: to make high-energy, world-class dance education accessible to everyone. Today, we are proud to empower dancers of all ages and experience levels across multiple styles.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-base mb-1">Our Mission</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Inspire joy, foster self-confidence, and build healthy habits through creative movement.
                    </p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-base mb-1">Our Vision</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Nurture a vibrant dance community that celebrates every milestone, step by step.
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <Link href="/about">
                    <Button className="rounded-full h-12 px-7 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30">
                      Learn More About Us
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-4">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Why Dancers Choose Us</h3>
                <ul className="space-y-4">
                  {[
                    { title: "World-Class Choreographers", desc: "Trained professionals from top international & national dance academies." },
                    { title: "Inclusive & Encouraging", desc: "No judgment or pressure — beginner friendly batches starting weekly." },
                    { title: "State-of-the-Art Studio", desc: "Sprung wooden floors, full-length mirrors, and immersive sound systems." },
                    { title: "Stage & Event Showcases", desc: "Annual recitals, flash mobs, and competition opportunities for students." }
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Classes Section */}
        <section id="classes" className="w-full py-24 bg-white">
          <div className="container px-4 md:px-6 lg:px-12 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Our Dance Classes</h2>
              <p className="text-gray-500">Choose from a variety of dance styles and find the perfect class for you.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {['All Classes', 'Kids', 'Adults', 'Beginners', 'Advanced'].map((tab, idx) => (
                <button 
                  key={tab} 
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                    idx === 0 ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Hip Hop", desc: "High energy street style dance for all ages.", price: "1500", img: "/images/hip-hop.jpg" },
                { name: "Bollywood", desc: "Learn dance on the latest Bollywood hits.", price: "1500", img: "/images/bollywood.jpg" },
                { name: "Contemporary", desc: "Express yourself through modern contemporary moves.", price: "1100", img: "/images/contemporary.jpg" },
                { name: "Salsa", desc: "Feel the rhythm with our exciting salsa classes.", price: "1500", img: "/images/salsa.jpg" },
              ].map((cls, idx) => (
                <Card key={idx} className="rounded-2xl overflow-hidden border-gray-100 shadow-lg hover:-translate-y-1 transition-transform duration-300">
                  <div 
                    className="w-full h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url('${cls.img}')` }}
                  />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold text-gray-900">{cls.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 min-h-[40px] mb-4">{cls.desc}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-gray-900">₹{cls.price}</span>
                      <span className="text-sm text-gray-500 font-medium">/ month</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full rounded-xl border-primary text-primary hover:bg-primary/5 font-semibold">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="w-full py-24 bg-gray-50/30 border-y border-gray-100">
          <div className="container px-4 md:px-6 lg:px-12 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Moments That Move Us</h2>
              <p className="text-gray-500 font-medium">Highlights from our classes, events, and performances.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {['All', 'Events', 'Classes', 'Performances'].map((tab, idx) => (
                <button 
                  key={tab} 
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-colors shadow-sm ${
                    idx === 0 ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-primary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 h-[400px] md:h-[600px] max-w-6xl mx-auto">
              {/* Main large image */}
              <div 
                className="col-span-2 row-span-2 rounded-3xl bg-cover bg-center shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 group relative overflow-hidden cursor-pointer"
                style={{ backgroundImage: "url('/images/about-studio.jpg')" }}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
              </div>
              
              {/* Top right small images */}
              <div 
                className="col-span-1 row-span-1 rounded-3xl bg-cover bg-center shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden cursor-pointer"
                style={{ backgroundImage: "url('/images/contemporary.jpg')" }}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
              </div>
              <div 
                className="col-span-1 row-span-1 rounded-3xl bg-cover bg-center shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden cursor-pointer"
                style={{ backgroundImage: "url('/images/salsa.jpg')" }}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
              </div>
              
              {/* Bottom right wide image */}
              <div 
                className="col-span-2 row-span-1 rounded-3xl bg-cover bg-center shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden cursor-pointer"
                style={{ backgroundImage: "url('/images/bollywood.jpg')" }}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Instructors Section */}
        <section id="instructors" className="w-full py-24 bg-gray-50/50">
          <div className="container px-4 md:px-6 lg:px-12 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Meet Our Instructors</h2>
              <p className="text-gray-500">Learn from the best and most passionate dance professionals.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: "Alex Johnson", role: "Hip Hop Specialist", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop" },
                { name: "Priya Sharma", role: "Bollywood Expert", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop" },
                { name: "John D'Cruz", role: "Salsa Instructor", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" },
                { name: "Sneha Iyer", role: "Contemporary Coach", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" },
              ].map((instructor, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="w-48 h-48 rounded-full overflow-hidden mb-4 shadow-lg border-4 border-white">
                    <div 
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url('${instructor.img}')` }}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{instructor.name}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-3">{instructor.role}</p>
                  <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors">
                      <Share2 className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-24 bg-white">
          <div className="container px-4 md:px-6 lg:px-12 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Simple & Affordable Pricing</h2>
              <p className="text-gray-500">Choose the plan that works best for your dance journey.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Trial Plan */}
              <Card className="rounded-3xl border-gray-100 bg-white text-center p-6 h-[400px] flex flex-col shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-600 font-semibold">Trial Class</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center gap-6">
                  <div>
                    <span className="text-4xl font-extrabold text-gray-900">₹499</span>
                  </div>
                  <ul className="text-sm text-gray-500 space-y-3 font-medium">
                    <li>1 Class</li>
                    <li>Valid for 7 Days</li>
                    <li>Access to One Class</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full rounded-full border-gray-200 text-gray-900 hover:bg-gray-50 h-12 font-bold">
                    Book Now
                  </Button>
                </CardFooter>
              </Card>

              {/* Monthly Plan (Highlighted) */}
              <Card className="rounded-3xl border-none bg-primary text-white text-center p-6 h-[420px] flex flex-col relative shadow-xl transform scale-105 z-10 -mt-2">
                <CardHeader>
                  <CardTitle className="text-lg text-white font-semibold">Monthly Plan</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center gap-6">
                  <div>
                    <span className="text-5xl font-extrabold text-white">₹1500</span>
                    <span className="text-white/80 block mt-1 text-xs font-semibold">per month</span>
                  </div>
                  <ul className="text-sm text-white/90 space-y-3 font-medium">
                    <li>4 Classes / Month</li>
                    <li>Valid for 30 Days</li>
                    <li>Access to Group Classes</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full rounded-full bg-white text-primary hover:bg-gray-50 h-12 font-bold">
                    Book Now
                  </Button>
                </CardFooter>
              </Card>

              {/* Quarterly */}
              <Card className="rounded-3xl border-gray-100 bg-white text-center p-6 h-[400px] flex flex-col shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-600 font-semibold">Quarterly Plan</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center gap-6">
                  <div>
                    <span className="text-4xl font-extrabold text-gray-900">₹4000</span>
                  </div>
                  <ul className="text-sm text-gray-500 space-y-3 font-medium">
                    <li>12 Classes / 3 Months</li>
                    <li>Valid for 90 Days</li>
                    <li>Access to All Classes</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full rounded-full border-gray-200 text-gray-900 hover:bg-gray-50 h-12 font-bold">
                    Book Now
                  </Button>
                </CardFooter>
              </Card>

              {/* Yearly */}
              <Card className="rounded-3xl border-gray-100 bg-white text-center p-6 h-[400px] flex flex-col shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-600 font-semibold">Yearly Plan</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center gap-6">
                  <div>
                    <span className="text-4xl font-extrabold text-gray-900">₹12000</span>
                  </div>
                  <ul className="text-sm text-gray-500 space-y-3 font-medium">
                    <li>Unlimited Classes</li>
                    <li>Valid for 12 Months</li>
                    <li>Priority Support</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full rounded-full border-gray-200 text-gray-900 hover:bg-gray-50 h-12 font-bold">
                    Book Now
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-24 bg-gray-50/50">
          <div className="container px-4 md:px-6 lg:px-12 mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 max-w-5xl mx-auto">
              <div className="lg:w-1/2 space-y-6">
                <h2 className="text-4xl font-extrabold text-gray-900">Contact StepUp</h2>
                <p className="text-lg text-gray-500">Have questions about our studio, class timings, or custom workshops? Get in touch with our team!</p>
                
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">123 Rhythm Boulevard, Studio Block, Mumbai</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">hello@stepup.com</span>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2">
                <Card className="rounded-2xl border-gray-100 bg-white p-6 shadow-xl">
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">First Name</label>
                        <input type="text" placeholder="John" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Last Name</label>
                        <input type="text" placeholder="Doe" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">Email Address</label>
                      <input type="email" placeholder="john@example.com" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">Message</label>
                      <textarea rows={4} placeholder="Tell us what dance styles interest you..." className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all resize-none"></textarea>
                    </div>
                    <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold gap-2 shadow-lg shadow-primary/30 mt-2">
                      <Send className="w-4 h-4" /> Send Message
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 text-gray-600 py-12 border-t border-gray-200 text-center">
        <div className="container mx-auto px-4 space-y-4">
          <div className="flex justify-center items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              StepUp
            </span>
          </div>
          <p className="text-sm">Dance Your Way to a Better You.</p>
          <p className="text-xs text-gray-400">© 2026 StepUp Dance Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
