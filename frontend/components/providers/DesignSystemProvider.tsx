'use client'

import { useEffect, useState, createContext, useContext } from 'react'

interface DesignSystemContextValue {
  isLoaded: boolean
  reload: () => void
}

const DesignSystemContext = createContext<DesignSystemContextValue>({
  isLoaded: false,
  reload: () => {},
})

export function useDesignSystem() {
  return useContext(DesignSystemContext)
}

interface DesignSystemProviderProps {
  children: React.ReactNode
}

export function DesignSystemProvider({ children }: DesignSystemProviderProps) {
  const [cssVariables, setCssVariables] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)

  const loadTokens = async () => {
    try {
      const response = await fetch('/api/design-system/css', {
        cache: 'no-store',
      })
      if (response.ok) {
        const css = await response.text()
        setCssVariables(css)
        setIsLoaded(true)
      }
    } catch (error) {
      console.error('Error loading design system tokens:', error)
      // En cas d'error, seguim sense variables (els components usaran els valors hardcoded)
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    loadTokens()
  }, [])

  const reload = () => {
    setIsLoaded(false)
    loadTokens()
  }

  return (
    <DesignSystemContext.Provider value={{ isLoaded, reload }}>
      {cssVariables && (
        <style
          id="design-system-variables"
          dangerouslySetInnerHTML={{ __html: cssVariables }}
        />
      )}
      {children}
    </DesignSystemContext.Provider>
  )
}
