import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface GeneratedPanel {
  id: number;
  sceneDescription: string;
  imageUrl: string;
  panelNumber: number;
}

export default function PanelGenerator({ projectId, chapterId }: { projectId: number; chapterId: number }) {
  const [panels, setPanels] = useState<GeneratedPanel[]>([]);
  const [currentPanel, setCurrentPanel] = useState({
    sceneDescription: "",
    panelNumber: 1,
    style: "",
  });
  const [generatingPanel, setGeneratingPanel] = useState<number | null>(null);

  const generatePanelMutation = trpc.panels.generateImage.useMutation({
    onSuccess: (data) => {
      const newPanel: GeneratedPanel = {
        id: Date.now(),
        sceneDescription: currentPanel.sceneDescription,
        imageUrl: data.imageUrl,
        panelNumber: currentPanel.panelNumber,
      };
      setPanels([...panels, newPanel]);
      setCurrentPanel({
        sceneDescription: "",
        panelNumber: currentPanel.panelNumber + 1,
        style: "",
      });
      setGeneratingPanel(null);
      toast.success("Panel generated successfully");
    },
    onError: () => {
      setGeneratingPanel(null);
      toast.error("Failed to generate panel");
    },
  });

  const handleGeneratePanel = async () => {
    if (!currentPanel.sceneDescription.trim()) {
      toast.error("Please describe the scene");
      return;
    }

    setGeneratingPanel(currentPanel.panelNumber);
    generatePanelMutation.mutate({
      projectId,
      chapterId,
      sceneDescription: currentPanel.sceneDescription,
      panelNumber: currentPanel.panelNumber,
      style: currentPanel.style || undefined,
    });
  };

  const handleDeletePanel = (id: number) => {
    setPanels(panels.filter((p) => p.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Panel Generator</h1>
          <p className="text-muted-foreground mt-2">Create manga-style comic panels from scene descriptions</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Panel Input */}
          <Card className="border-border/50 lg:col-span-1">
            <CardHeader>
              <CardTitle>Create Panel</CardTitle>
              <CardDescription>Panel #{currentPanel.panelNumber}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="scene">Scene Description</Label>
                <Textarea
                  id="scene"
                  placeholder="Describe what happens in this panel..."
                  value={currentPanel.sceneDescription}
                  onChange={(e) => setCurrentPanel({ ...currentPanel, sceneDescription: e.target.value })}
                  className="bg-input border-border/50 min-h-32"
                />
              </div>

              <div>
                <Label htmlFor="style">Style (optional)</Label>
                <Input
                  id="style"
                  placeholder="e.g., action scene, emotional moment"
                  value={currentPanel.style}
                  onChange={(e) => setCurrentPanel({ ...currentPanel, style: e.target.value })}
                  className="bg-input border-border/50"
                />
              </div>

              <Button
                onClick={handleGeneratePanel}
                disabled={generatingPanel === currentPanel.panelNumber}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6"
              >
                {generatingPanel === currentPanel.panelNumber ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Panel
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Panels */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Generated Panels ({panels.length})</h2>
            </div>

            {panels.length === 0 ? (
              <Card className="border-border/50 p-12 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No panels generated yet</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {panels.map((panel) => (
                  <Card key={panel.id} className="border-border/50 overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Panel {panel.panelNumber}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {panel.sceneDescription}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePanel(panel.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={panel.imageUrl}
                        alt={`Panel ${panel.panelNumber}`}
                        className="w-full rounded border border-border/50 aspect-[9/16] object-cover"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {panels.length > 0 && (
          <div className="flex gap-4 justify-end pt-8 border-t border-border/50">
            <Button variant="outline" className="border-border/50">
              Save as Draft
            </Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 py-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Create Comic Chapter
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
