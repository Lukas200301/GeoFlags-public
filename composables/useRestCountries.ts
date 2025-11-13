/**
 * Composable for fetching additional country data from REST Countries API (via backend cache)
 */

export interface RestCountryData {
  population: number | null
  timezones: string[]
  carSide: string | null
  coatOfArms: string | null
  cachedAt: string
}

export const useRestCountries = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  /**
   * Fetch country data from our backend API (which caches REST Countries data)
   */
  const fetchCountryData = async (countryCode: string): Promise<RestCountryData | null> => {
    try {
      const response = await fetch(`${apiBase}/api/countries/${countryCode.toLowerCase()}`)

      if (!response.ok) {
        console.error(`Failed to fetch country data for ${countryCode}:`, response.statusText)
        return null
      }

      const data: RestCountryData = await response.json()
      return data
    } catch (error) {
      console.error(`Error fetching country data for ${countryCode}:`, error)
      return null
    }
  }

  /**
   * Format population with commas
   */
  const formatPopulation = (population: number | null): string => {
    if (!population) return 'N/A'
    return population.toLocaleString('en-US')
  }

  /**
   * Format car side for display
   */
  const formatCarSide = (side: string | null): string => {
    if (!side) return 'N/A'
    return side === 'right' ? 'Right' : 'Left'
  }

  return {
    fetchCountryData,
    formatPopulation,
    formatCarSide,
  }
}
