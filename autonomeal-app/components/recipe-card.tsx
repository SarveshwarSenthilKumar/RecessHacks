"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, ChefHat, ArrowRight } from "lucide-react"
import Image from "next/image"

interface Recipe {
  id: number
  title: string
  description: string
  difficulty: string
  time: string
  servings: number
  ingredients: string[]
  steps: string[]
  image: string
}

interface RecipeCardProps {
  recipe: Recipe
  onSelect: () => void
}

export function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "intermediate":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={recipe.image || "/placeholder.svg"}
          alt={recipe.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <Badge className={`${getDifficultyColor(recipe.difficulty)} font-semibold`}>{recipe.difficulty}</Badge>
        </div>
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="font-montserrat text-xl group-hover:text-primary transition-colors">
          {recipe.title}
        </CardTitle>
        <CardDescription className="text-base leading-relaxed">{recipe.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="h-4 w-4" />
            <span>{recipe.steps.length} steps</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Key Ingredients:</p>
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 4).map((ingredient, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {ingredient}
              </Badge>
            ))}
            {recipe.ingredients.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{recipe.ingredients.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        <Button
          onClick={onSelect}
          className="w-full h-12 font-semibold font-montserrat group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 bg-transparent"
          variant="outline"
        >
          Start Cooking
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  )
}
