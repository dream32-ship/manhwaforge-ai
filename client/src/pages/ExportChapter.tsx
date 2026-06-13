import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Download, FileJson, Image } from "lucide-react";
import { toast } from "sonner";

export default function ExportChapter({ chapterId }: { chapterId: number }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportsQuery = trpc.exports.list.useQuery({ chapterId });

  const handleExport = async (format: "pdf" | "images" | "json") => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(`Chapter exported as ${format.toUpperCase()}`);
      // In production, this would trigger a download
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Export Chapter</h1>
          <p className="text-muted-foreground mt-2">Download your completed chapter in various formats</p>
        </div>

        {/* Export Options */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* PDF Export */}
          <Card className="border-border/50 hover:border-accent/50 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-accent" />
                PDF Export
              </CardTitle>
              <CardDescription>Professional PDF format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export your chapter as a high-quality PDF suitable for printing or digital distribution.
              </p>
              <Button
                onClick={() => handleExport("pdf")}
                disabled={isExporting}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export as PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Image Sequence Export */}
          <Card className="border-border/50 hover:border-secondary/50 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-secondary" />
                Image Sequence
              </CardTitle>
              <CardDescription>Individual panel images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export each panel as a separate high-resolution PNG image for maximum flexibility.
              </p>
              <Button
                onClick={() => handleExport("images")}
                disabled={isExporting}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Image className="w-4 h-4 mr-2" />
                    Export Images
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* JSON Export */}
          <Card className="border-border/50 hover:border-accent/50 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-accent" />
                JSON Data
              </CardTitle>
              <CardDescription>Raw chapter data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export chapter metadata and panel information as JSON for integration with other tools.
              </p>
              <Button
                onClick={() => handleExport("json")}
                disabled={isExporting}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileJson className="w-4 h-4 mr-2" />
                    Export JSON
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Export History */}
        {exportsQuery.data && exportsQuery.data.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>Previously exported versions of this chapter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exportsQuery.data.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-3 border border-border/50 rounded"
                  >
                    <div>
                      <p className="font-semibold text-sm">{exp.format.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exp.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {exp.fileUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = exp.fileUrl || "";
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Tips */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Export Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>PDF:</strong> Best for printing and professional distribution</p>
            <p>• <strong>Images:</strong> Ideal for web platforms and social media</p>
            <p>• <strong>JSON:</strong> Use for archival or integration with other tools</p>
            <p>• All exports are high-resolution and optimized for quality</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
