'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Wand2, Image as ImageIcon } from "lucide-react"
import { generateRecipe, generateDishImage } from "@/lib/api"

export function RecipeGenerator() {
  const [dishName, setDishName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRecipe, setGeneratedRecipe] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  const handleGenerateRecipe = async () => {
    if (!dishName.trim()) return
    
    setIsGenerating(true)
    try {
      const result = await generateRecipe(dishName)
      setGeneratedRecipe(result.recipe)
    } catch (error) {
      console.error('Error generating recipe:', error)
      // Handle error (show toast/notification)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!dishName.trim()) return
    
    setIsGeneratingImage(true)
    try {
      const result = await generateDishImage(dishName)
      setGeneratedImage(result.image_url)
    } catch (error) {
      console.error('Error generating image:', error)
      // Handle error (show toast/notification)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Generate a New Recipe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter a dish name (e.g., Chicken Alfredo)"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleGenerateRecipe}
            disabled={isGenerating || !dishName.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Recipe
              </>
            )}
          </Button>
        </div>

        {generatedRecipe && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Generated Recipe</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !dishName.trim()}
              >
                {isGeneratingImage ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="mr-2 h-4 w-4" />
                )}
                Generate Image
              </Button>
            </div>
            <div className="prose max-w-none">
              {generatedImage && (
                <div className="mb-4">
                  <img 
                    src={generatedImage} 
                    alt={dishName} 
                    className="rounded-lg w-full max-w-md max-h-64 object-cover"
                  />
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: generatedRecipe.replace(/\n/g, '<br />') }} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
