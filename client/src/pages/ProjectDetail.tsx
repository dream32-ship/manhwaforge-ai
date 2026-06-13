import { useParams } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, BookOpen, Users, Sparkles } from "lucide-react";
import { useState } from "react";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  const projectQuery = trpc.projects.get.useQuery(
    { projectId: parseInt(projectId || "0") },
    { enabled: !!projectId }
  );

  const chaptersQuery = trpc.chapters.list.useQuery(
    { projectId: parseInt(projectId || "0") },
    { enabled: !!projectId }
  );

  const charactersQuery = trpc.characters.list.useQuery(
    { projectId: parseInt(projectId || "0") },
    { enabled: !!projectId }
  );

  if (projectQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!projectQuery.data) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const project = projectQuery.data;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight">{project.title}</h1>
              <p className="text-muted-foreground mt-2">{project.description}</p>
            </div>
            <div className="text-right">
              <div className="text-xs px-3 py-1 bg-accent/10 text-accent rounded inline-block">
                {project.status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-accent">{chaptersQuery.data?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Chapters</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-secondary">{charactersQuery.data?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Characters</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-accent">
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <p className="text-sm text-muted-foreground">Created</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
            <TabsTrigger value="characters">Characters</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 justify-start">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Story
                  </Button>
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Create Character
                  </Button>
                  <Button className="w-full border border-border/50 justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    New Chapter
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Project Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Genre</p>
                    <p className="font-semibold">{project.genre || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold capitalize">{project.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-semibold">{new Date(project.updatedAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Chapters Tab */}
          <TabsContent value="chapters" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Chapters</h2>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                New Chapter
              </Button>
            </div>

            {chaptersQuery.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : chaptersQuery.data && chaptersQuery.data.length > 0 ? (
              <div className="grid gap-4">
                {chaptersQuery.data.map((chapter) => (
                  <Card key={chapter.id} className="border-border/50 hover:border-accent/50 transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>Chapter {chapter.chapterNumber}</CardTitle>
                          <CardDescription>{chapter.title || "Untitled"}</CardDescription>
                        </div>
                        <div className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">
                          {chapter.status}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(chapter.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border/50 p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No chapters yet</p>
              </Card>
            )}
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Characters</h2>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                New Character
              </Button>
            </div>

            {charactersQuery.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : charactersQuery.data && charactersQuery.data.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {charactersQuery.data.map((character) => (
                  <Card key={character.id} className="border-border/50 hover:border-accent/50 transition-all cursor-pointer">
                    {character.referenceImageUrl && (
                      <img
                        src={character.referenceImageUrl}
                        alt={character.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{character.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{character.description || "No description"}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border/50 p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No characters yet</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
