import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

const GENRES = ["action", "romance", "fantasy", "sci-fi", "mystery", "slice-of-life", "horror", "comedy"];
const THEMES = ["adventure", "redemption", "power", "friendship", "betrayal", "love", "survival", "discovery"];

export default function StoryGenerator({ projectId }: { projectId: number }) {
  const [step, setStep] = useState<"input" | "outline" | "script">("input");
  const [formData, setFormData] = useState({
    genre: "",
    themes: [] as string[],
    characters: "",
    premise: "",
  });
  const [outline, setOutline] = useState("");
  const [script, setScript] = useState("");
  const [copied, setCopied] = useState(false);

  const generateOutlineMutation = trpc.stories.generateOutline.useMutation({
    onSuccess: (data) => {
      setOutline(data.outline);
      setStep("outline");
    },
  });

  const generateScriptMutation = trpc.stories.generateChapterScript.useMutation({
    onSuccess: (data) => {
      setScript(data.script);
      setStep("script");
    },
  });

  const handleGenerateOutline = async () => {
    if (!formData.genre || formData.themes.length === 0 || !formData.premise) {
      toast.error("Please fill in all fields");
      return;
    }

    generateOutlineMutation.mutate({
      projectId,
      genre: formData.genre,
      themes: formData.themes,
      characters: formData.characters.split(",").map((c) => c.trim()).filter(Boolean),
      premise: formData.premise,
    });
  };

  const handleGenerateScript = async () => {
    generateScriptMutation.mutate({
      projectId,
      storyOutline: outline,
      chapterNumber: 1,
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Story Generator</h1>
          <p className="text-muted-foreground mt-2">Generate complete story outlines and chapter scripts with AI</p>
        </div>

        {step === "input" && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Story Details</CardTitle>
              <CardDescription>Provide information about your manhwa story</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={formData.genre} onValueChange={(value) => setFormData({ ...formData, genre: value })}>
                    <SelectTrigger className="bg-input border-border/50">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/50">
                      {GENRES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="themes">Themes (select multiple)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            themes: formData.themes.includes(theme)
                              ? formData.themes.filter((t) => t !== theme)
                              : [...formData.themes, theme],
                          });
                        }}
                        className={`px-3 py-2 rounded text-sm transition-all border ${ formData.themes.includes(theme)
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-input border-border/50 text-foreground hover:border-accent/50"
                        }`}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="characters">Main Characters (comma-separated)</Label>
                <Input
                  id="characters"
                  placeholder="Hero, Villain, Love Interest"
                  value={formData.characters}
                  onChange={(e) => setFormData({ ...formData, characters: e.target.value })}
                  className="bg-input border-border/50"
                />
              </div>

              <div>
                <Label htmlFor="premise">Story Premise</Label>
                <Textarea
                  id="premise"
                  placeholder="Describe your story idea in detail..."
                  value={formData.premise}
                  onChange={(e) => setFormData({ ...formData, premise: e.target.value })}
                  className="bg-input border-border/50 min-h-32"
                />
              </div>

              <Button
                onClick={handleGenerateOutline}
                disabled={generateOutlineMutation.isPending}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg"
              >
                {generateOutlineMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Story Outline...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Story Outline
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "outline" && (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Story Outline</CardTitle>
                  <CardDescription>AI-generated story outline for your manhwa</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(outline)}
                  className="border-border/50"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <Streamdown>{outline}</Streamdown>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep("input")}
                className="border-border/50"
              >
                Back
              </Button>
              <Button
                onClick={handleGenerateScript}
                disabled={generateScriptMutation.isPending}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg"
              >
                {generateScriptMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Chapter Script...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Chapter 1 Script
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "script" && (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Chapter 1 Script</CardTitle>
                  <CardDescription>Scene-by-scene breakdown ready for panel generation</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(script)}
                  className="border-border/50"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <Streamdown>{script}</Streamdown>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep("outline")}
                className="border-border/50"
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Panels
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
