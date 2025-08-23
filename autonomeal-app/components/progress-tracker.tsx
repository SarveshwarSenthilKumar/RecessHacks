"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Clock, Users, ChefHat, Camera, Star } from "lucide-react"
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

interface ProgressTrackerProps {
  recipe: Recipe
}

export function ProgressTracker({ recipe }: ProgressTrackerProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  const toggleStep = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter((i) => i !== stepIndex))
    } else {
      const newCompleted = [...completedSteps, stepIndex]
      setCompletedSteps(newCompleted)

      if (newCompleted.length === recipe.steps.length) {
        setIsCompleted(true)
      }
    }
  }

  const progress = (completedSteps.length / recipe.steps.length) * 100

  return (
    <div className="space-y-8">
      {/* Recipe Header */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="relative h-64 md:h-80">
          <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold font-montserrat mb-2">{recipe.title}</h1>
            <p className="text-lg opacity-90 mb-4">{recipe.description}</p>
            <div className="flex items-center gap-4 text-sm">
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
                <span>{recipe.difficulty}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-montserrat">Cooking Progress</CardTitle>
              <CardDescription>
                {completedSteps.length} of {recipe.steps.length} steps completed
              </CardDescription>
            </div>
            {isCompleted && (
              <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                <Star className="h-4 w-4 mr-1" />
                Recipe Completed!
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3 mb-4" />
          <p className="text-sm text-muted-foreground">
            {progress === 100
              ? "Congratulations! You've completed this recipe."
              : `${Math.round(progress)}% complete - keep going!`}
          </p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Ingredients */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-montserrat">Ingredients</CardTitle>
            <CardDescription>Everything you'll need</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="capitalize">{ingredient}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cooking Steps */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold font-montserrat">Cooking Steps</h2>
          {recipe.steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index)
            return (
              <Card
                key={index}
                className={`border-0 shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl ${
                  isCompleted ? "bg-green-50 border-green-200" : "hover:bg-muted/20"
                }`}
                onClick={() => toggleStep(index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-semibold">
                          Step {index + 1}
                        </Badge>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
                        )}
                      </div>
                      <p
                        className={`text-lg leading-relaxed ${isCompleted ? "line-through text-muted-foreground" : ""}`}
                      >
                        {step}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Completion Actions */}
      {isCompleted && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold font-montserrat text-green-800 mb-2">Recipe Completed!</h3>
              <p className="text-green-700">
                Congratulations! You've successfully completed {recipe.title}. Every meal is indeed a step toward
                independence!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="font-semibold font-montserrat">
                <Camera className="mr-2 h-5 w-5" />
                Share Your Creation
              </Button>
              <Button variant="outline" size="lg" className="font-semibold font-montserrat bg-transparent">
                Cook Another Recipe
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
