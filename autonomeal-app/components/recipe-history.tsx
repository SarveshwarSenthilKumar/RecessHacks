"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Heart, Star, ChefHat } from "lucide-react"

interface Recipe {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  cookTime: string
  rating: number
  isFavorite: boolean
  completedAt: string
  cuisine: string
}

export function RecipeHistory() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual API call to fetch user's recipe history
    setTimeout(() => {
      setRecipes([
        {
          id: "1",
          title: "Simple Pasta Carbonara",
          difficulty: "Easy",
          cookTime: "20 min",
          rating: 5,
          isFavorite: true,
          completedAt: "2024-01-15",
          cuisine: "Italian",
        },
        {
          id: "2",
          title: "Chicken Stir Fry",
          difficulty: "Medium",
          cookTime: "25 min",
          rating: 4,
          isFavorite: false,
          completedAt: "2024-01-12",
          cuisine: "Asian",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const toggleFavorite = (id: string) => {
    setRecipes(recipes.map((recipe) => (recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe)))
  }

  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Recipe History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          Recipe History
        </CardTitle>
        <CardDescription>Your recent cooking adventures</CardDescription>
      </CardHeader>
      <CardContent>
        {recipes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No recipes completed yet. Start cooking to see your history!
          </p>
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                      {recipe.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {recipe.cuisine}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {recipe.cookTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {recipe.rating}/5
                    </span>
                    <Badge
                      variant={
                        recipe.difficulty === "Easy"
                          ? "default"
                          : recipe.difficulty === "Medium"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {recipe.difficulty}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(recipe.id)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Heart className={`h-4 w-4 ${recipe.isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
