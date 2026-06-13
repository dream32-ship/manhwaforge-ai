import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function CharacterCreator({ projectId }: { projectId: number }) {
  const [step, setStep] = useState<"input" | "profile" | "image">("input");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [profile, setProfile] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState("");

  const generateProfileMutation = trpc.characters.generateProfile.useMutation({
    onSuccess: (data) => {
      setProfile(data);
      setStep("profile");
    },
  });

  const generateImageMutation = trpc.characters.generateImage.useMutation({
    onSuccess: (data) => {
      setImageUrl(data.url);
      setStep("image");
    },
  });

  const handleGenerateProfile = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    generateProfileMutation.mutate({
      projectId,
      name: formData.name,
      description: formData.description,
    });
  };

  const handleGenerateImage = async () => {
    if (!profile) return;

    generateImageMutation.mutate({
      projectId,
      name: formData.name,
      appearance: profile.appearance,
      style: "professional manga character",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Character Creator</h1>
          <p className="text-muted-foreground mt-2">Create detailed character profiles with AI-generated reference images</p>
        </div>

        {step === "input" && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Character Details</CardTitle>
              <CardDescription>Describe your character to generate a detailed profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Character Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Kai Nakamura"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-input border-border/50"
                />
              </div>

              <div>
                <Label htmlFor="description">Character Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your character's appearance, personality, background, and role in the story..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-input border-border/50 min-h-40"
                />
              </div>

              <Button
                onClick={handleGenerateProfile}
                disabled={generateProfileMutation.isPending}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg"
              >
                {generateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Character Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "profile" && profile && (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>{formData.name}</CardTitle>
                <CardDescription>AI-generated character profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-accent mb-2">Personality</h3>
                    <p className="text-muted-foreground">{profile.personality}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">Backstory</h3>
                    <p className="text-muted-foreground">{profile.backstory}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-accent mb-2">Appearance</h3>
                  <p className="text-muted-foreground">{profile.appearance}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">Skills</h3>
                    <ul className="space-y-1">
                      {profile.skills?.map((skill: string, i: number) => (
                        <li key={i} className="text-muted-foreground flex items-center gap-2">
                          <span className="w-1 h-1 bg-accent rounded-full" />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">Weaknesses</h3>
                    <ul className="space-y-1">
                      {profile.weaknesses?.map((weakness: string, i: number) => (
                        <li key={i} className="text-muted-foreground flex items-center gap-2">
                          <span className="w-1 h-1 bg-destructive rounded-full" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
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
                onClick={handleGenerateImage}
                disabled={generateImageMutation.isPending}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg"
              >
                {generateImageMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Reference Image...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Generate Reference Image
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "image" && imageUrl && (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>{formData.name} - Reference Image</CardTitle>
                <CardDescription>AI-generated manga-style character reference</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <img
                    src={imageUrl}
                    alt={formData.name}
                    className="w-full max-w-md mx-auto rounded border border-border/50"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    High-quality reference image ready for use in your panels
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep("profile")}
                className="border-border/50"
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Save Character
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
