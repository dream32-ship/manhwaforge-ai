import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { ArrowRight, Zap, Sparkles, Palette, BookOpen, Download } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container py-4 flex justify-between items-center">
            <div className="text-2xl font-bold tracking-wider">
              <span className="text-accent">MANHWA</span>
              <span className="text-secondary">FORGE</span>
            </div>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Sign In
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                Create Professional
                <br />
                <span className="text-accent">Manhwa</span> with AI
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                From story idea to publishable webtoon chapter in minutes. Powered by AI, built for creators.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                size="lg"
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 group"
              >
                Get Started Free
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-accent/50 text-accent hover:bg-accent/10"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-12 border-t border-border/50">
              <div>
                <div className="text-3xl font-bold text-accent">100%</div>
                <div className="text-sm text-muted-foreground">AI Powered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary">0$</div>
                <div className="text-sm text-muted-foreground">Free Tier Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">∞</div>
                <div className="text-sm text-muted-foreground">Unlimited Projects</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-20 border-t border-border/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
              Powerful AI Features
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="group p-6 border border-border/50 hover:border-accent/50 transition-all duration-300 hover:bg-card/50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded text-accent group-hover:bg-accent/20 transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">AI Story Generator</h3>
                    <p className="text-muted-foreground">
                      Generate complete story outlines, character arcs, and chapter scripts with advanced AI. Powered by Gemini for professional-quality narratives.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group p-6 border border-border/50 hover:border-secondary/50 transition-all duration-300 hover:bg-card/50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary/10 rounded text-secondary group-hover:bg-secondary/20 transition-colors">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Character Creator</h3>
                    <p className="text-muted-foreground">
                      Design characters with AI-generated profiles and manga-style reference images. Maintain consistency across all chapters.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group p-6 border border-border/50 hover:border-accent/50 transition-all duration-300 hover:bg-card/50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded text-accent group-hover:bg-accent/20 transition-colors">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Panel Generator</h3>
                    <p className="text-muted-foreground">
                      Generate high-quality manga panels from scene descriptions. Create entire chapters with AI-powered composition and art.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group p-6 border border-border/50 hover:border-secondary/50 transition-all duration-300 hover:bg-card/50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary/10 rounded text-secondary group-hover:bg-secondary/20 transition-colors">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Export & Publish</h3>
                    <p className="text-muted-foreground">
                      Export chapters as PDF, image sequences, or ZIP packages. Ready for publication on webtoon platforms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="group p-6 border border-border/50 hover:border-accent/50 transition-all duration-300 hover:bg-card/50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded text-accent group-hover:bg-accent/20 transition-colors">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Asset Library</h3>
                    <p className="text-muted-foreground">
                      Save and organize characters, backgrounds, and effects. Reuse assets across projects for consistent storytelling.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="group p-6 border border-border/50 hover:border-secondary/50 transition-all duration-300 hover:bg-card/50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary/10 rounded text-secondary group-hover:bg-secondary/20 transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Project Management</h3>
                    <p className="text-muted-foreground">
                      Organize multiple projects with chapter-level tracking. Collaborate and manage your entire webtoon portfolio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="container py-20 border-t border-border/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
              Your Creative Workflow
            </h2>

            <div className="space-y-4">
              {[
                { num: "01", title: "Story Idea", desc: "Enter your premise, genre, and themes" },
                { num: "02", title: "AI Generation", desc: "Generate story outline and character profiles" },
                { num: "03", title: "Script Creation", desc: "AI writes detailed chapter scripts" },
                { num: "04", title: "Panel Generation", desc: "Generate manga-style panels from scenes" },
                { num: "05", title: "Editing", desc: "Add dialogue, effects, and polish" },
                { num: "06", title: "Export", desc: "Download as PDF or image sequence" },
              ].map((step, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center border-2 border-accent/50 group-hover:border-accent group-hover:bg-accent/10 transition-all">
                    <span className="text-2xl font-black text-accent">{step.num}</span>
                  </div>
                  <div className="flex-1 py-2">
                    <h3 className="text-xl font-bold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                  {i < 5 && (
                    <div className="hidden md:block flex-shrink-0 w-1 h-12 bg-gradient-to-b from-accent to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-20 border-t border-border/50">
          <div className="max-w-2xl mx-auto text-center space-y-8 p-8 border border-accent/30 bg-accent/5">
            <h2 className="text-4xl font-black">Ready to Create?</h2>
            <p className="text-lg text-muted-foreground">
              Start creating professional manhwa today. No credit card required.
            </p>
            <Button
              size="lg"
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6"
            >
              Get Started Free
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 mt-20">
          <div className="container text-center text-muted-foreground text-sm">
            <p>© 2026 ManhwaForge AI. Powered by Gemini and advanced AI technology.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
