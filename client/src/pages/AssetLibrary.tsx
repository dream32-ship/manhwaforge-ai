import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, Download, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function AssetLibrary({ projectId }: { projectId: number }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("characters");

  const assetsQuery = trpc.assets.list.useQuery({ projectId });
  const deleteAssetMutation = trpc.assets.delete.useMutation({
    onSuccess: () => {
      assetsQuery.refetch();
      toast.success("Asset deleted");
    },
  });

  const filteredAssets = assetsQuery.data?.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const characterAssets = filteredAssets.filter((a) => a.type === "character");
  const panelAssets = filteredAssets.filter((a) => a.type === "effect");
  const backgroundAssets = filteredAssets.filter((a) => a.type === "background");

  const handleDelete = (assetId: number) => {
    if (confirm("Delete this asset?")) {
      deleteAssetMutation.mutate({ assetId, projectId });
    }
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    toast.success("Download started");
  };

  const AssetGrid = ({ assets }: { assets: typeof characterAssets }) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.length === 0 ? (
        <Card className="border-border/50 col-span-full p-12 text-center">
          <p className="text-muted-foreground">No assets found</p>
        </Card>
      ) : (
        assets.map((asset) => (
          <Card key={asset.id} className="border-border/50 overflow-hidden hover:border-accent/50 transition-all">
            {asset.imageUrl && (
              <img
                src={asset.imageUrl}
                alt={asset.name}
                className="w-full h-40 object-cover"
              />
            )}
            <CardHeader className="pb-3">
              <CardTitle className="text-sm line-clamp-1">{asset.name}</CardTitle>
              <CardDescription className="text-xs">
                {new Date(asset.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              {asset.imageUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(asset.imageUrl || "", asset.name)}
                  className="flex-1 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(asset.id)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Asset Library</h1>
          <p className="text-muted-foreground mt-2">Organize and manage your generated characters, panels, and backgrounds</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border/50"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border/50">
            <TabsTrigger value="characters">
              Characters ({characterAssets.length})
            </TabsTrigger>
            <TabsTrigger value="panels">
              Panels ({panelAssets.length})
            </TabsTrigger>
            <TabsTrigger value="backgrounds">
              Backgrounds ({backgroundAssets.length})
            </TabsTrigger>
          </TabsList>

          {assetsQuery.isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <>
              <TabsContent value="characters" className="space-y-4">
                <AssetGrid assets={characterAssets} />
              </TabsContent>

              <TabsContent value="panels" className="space-y-4">
                <AssetGrid assets={panelAssets} />
              </TabsContent>

              <TabsContent value="backgrounds" className="space-y-4">
                <AssetGrid assets={backgroundAssets} />
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Stats */}
        {assetsQuery.data && assetsQuery.data.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Library Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-3xl font-bold text-accent">{characterAssets.length}</div>
                <p className="text-sm text-muted-foreground">Characters</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary">{panelAssets.length}</div>
                <p className="text-sm text-muted-foreground">Panels</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">{backgroundAssets.length}</div>
                <p className="text-sm text-muted-foreground">Backgrounds</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
