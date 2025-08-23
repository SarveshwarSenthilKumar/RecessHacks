"use client"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, Sparkles, User } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/30 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ChefHat className="h-10 w-10 text-primary" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-5 w-5 text-secondary" />
                </div>
              </div>
              <span className="text-3xl font-black font-montserrat bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                autonoMeal
              </span>
            </div>
            <LogoutButton />
          </div>

          {/* Welcome Section */}
          <Card className="border-0 shadow-2xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold font-montserrat">Welcome back, Chef!</CardTitle>
                  <CardDescription className="text-lg">{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Ready to continue your culinary journey? Let's create something delicious together.
              </p>
              <Button
                size="lg"
                className="h-12 px-8 text-lg font-semibold font-montserrat bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                onClick={() => (window.location.href = "/")}
              >
                Start Cooking
              </Button>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">0</div>
                <p className="text-sm text-muted-foreground">Recipes Completed</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-secondary mb-2">0</div>
                <p className="text-sm text-muted-foreground">Cooking Sessions</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">Beginner</div>
                <p className="text-sm text-muted-foreground">Current Level</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
