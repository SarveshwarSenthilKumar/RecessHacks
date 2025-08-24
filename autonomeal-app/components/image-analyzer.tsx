'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, Image as ImageIcon } from "lucide-react"
import { analyzeImage } from "@/lib/api"

export function ImageAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setAnalysis('') // Clear previous analysis
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    try {
      const result = await analyzeImage(selectedFile)
      setAnalysis(result.analysis)
    } catch (error) {
      console.error('Error analyzing image:', error)
      // Handle error (show toast/notification)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Analyze Food Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
          {previewUrl ? (
            <div className="relative group">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-64 max-w-full rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                  }}
                >
                  Change Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none hover:text-indigo-500"
                >
                  <span>Upload an image</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
            </div>
          )}
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!selectedFile || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Analyze Image
            </>
          )}
        </Button>

        {analysis && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
            <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
              {analysis}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
