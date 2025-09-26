import { useState, useEffect } from 'react'
import type { Property } from './types/Property'
import PropertyGrid from './components/PropertyGrid'
import ErrorBoundary from './components/ErrorBoundary'
import propertiesData from './data/properties.json'
import './App.css'

function App() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true)
        setError(null)
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Validate that we have data
        if (!propertiesData || !Array.isArray(propertiesData)) {
          throw new Error('Invalid data format')
        }
        
        setProperties(propertiesData as Property[])
      } catch (err) {
        console.error('Error loading properties:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while loading properties')
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Properties Found</h2>
          <p className="text-gray-600">There are no properties to display at the moment.</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <PropertyGrid properties={properties} />
    </ErrorBoundary>
  )
}

export default App
