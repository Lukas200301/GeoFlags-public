/**
 * Composable for managing country data
 * Uses world-countries for comprehensive, local country information
 */
import countriesData from 'world-countries'
import type { Country as WorldCountry } from 'world-countries'

export interface Country {
  name: string
  officialName: string
  code: string
  cca3: string
  cioc: string | null
  region: string
  subregion: string | null
  capital: string | null
  area: number
  languages: Record<string, string> | null
  currencies: Record<string, { name: string; symbol: string }> | null
  demonym: string | null
  flag: string
  neighbors: string[]
  latlng: [number, number] | null
  timezones: string[] | null
  continents: string[] | null
  // New fields from world-countries
  landlocked: boolean
  independent: boolean
  unMember: boolean
  unRegionalGroup: string | null
  tld: string[] | null
  idd: { root: string; suffixes: string[] } | null
  altSpellings: string[] | null
}

// Helper to get flag image URL from code (via backend API with caching)
const getFlagUrl = (code: string): string => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  return `${apiBase}/api/flags/${code.toLowerCase()}`
}

export const useCountries = () => {
  /**
   * Helper to convert CCA3 codes to CCA2 codes
   */
  const convertCCA3ArrayToCCA2 = (cca3Codes: string[]): string[] => {
    return cca3Codes
      .map((cca3) => {
        const country = countriesData.find(
          (c: WorldCountry) => c.cca3 === cca3
        )
        return country?.cca2
      })
      .filter((code): code is string => code !== undefined)
  }

  /**
   * Get all countries with formatted data
   */
  const getAllCountries = (): Country[] => {
    return countriesData.map((c: WorldCountry) => ({
      name: c.name.common,
      officialName: c.name.official,
      code: c.cca2,
      cca3: c.cca3,
      cioc: c.cioc || null,
      region: c.region,
      subregion: c.subregion || null,
      capital: Array.isArray(c.capital) && c.capital.length > 0 ? c.capital[0] : null,
      area: c.area,
      languages: c.languages || null,
      currencies: c.currencies || null,
      demonym: c.demonyms?.eng?.m || null,
      flag: getFlagUrl(c.cca2), // Generate flag URL
      neighbors: convertCCA3ArrayToCCA2(c.borders || []), // Convert CCA3 to CCA2
      latlng: c.latlng || null,
      timezones: null, // Will be fetched from REST Countries API
      continents: [c.region], // Use region as continent
      // New fields from world-countries
      landlocked: c.landlocked || false,
      independent: c.independent || false,
      unMember: c.unMember || false,
      unRegionalGroup: c.unRegionalGroup || null,
      tld: c.tld || null,
      idd: c.idd ? { root: c.idd.root || '', suffixes: c.idd.suffixes || [] } : null,
      altSpellings: c.altSpellings || null,
    }))
  }

  /**
   * Get a country by its code (CCA2)
   */
  const getCountryByCode = (code: string): Country | null => {
    const country = countriesData.find(
      (c: WorldCountry) => c.cca2.toLowerCase() === code.toLowerCase()
    )
    if (!country) return null

    return {
      name: country.name.common,
      officialName: country.name.official,
      code: country.cca2,
      cca3: country.cca3,
      cioc: country.cioc || null,
      region: country.region,
      subregion: country.subregion || null,
      capital: Array.isArray(country.capital) && country.capital.length > 0 ? country.capital[0] : null,
      area: country.area,
      languages: country.languages || null,
      currencies: country.currencies || null,
      demonym: country.demonyms?.eng?.m || null,
      flag: getFlagUrl(country.cca2),
      neighbors: convertCCA3ArrayToCCA2(country.borders || []), // Convert CCA3 to CCA2
      latlng: country.latlng || null,
      timezones: null,
      continents: [country.region],
      // New fields from world-countries
      landlocked: country.landlocked || false,
      independent: country.independent || false,
      unMember: country.unMember || false,
      unRegionalGroup: country.unRegionalGroup || null,
      tld: country.tld || null,
      idd: country.idd ? { root: country.idd.root || '', suffixes: country.idd.suffixes || [] } : null,
      altSpellings: country.altSpellings || null,
    }
  }

  /**
   * Get unique regions from all countries
   */
  const getRegions = (): string[] => {
    const regions = new Set(countriesData.map((c: WorldCountry) => c.region))
    return Array.from(regions).filter(Boolean).sort()
  }

  /**
   * Get unique subregions from all countries
   */
  const getSubregions = (): string[] => {
    const subregions = new Set(
      countriesData.map((c: WorldCountry) => c.subregion).filter(Boolean) as string[]
    )
    return Array.from(subregions).sort()
  }

  /**
   * Format large numbers with commas
   */
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US')
  }

  /**
   * Format area with km²
   */
  const formatArea = (area: number): string => {
    return `${formatNumber(area)} km²`
  }

  /**
   * Get country name by code (CCA2)
   */
  const getCountryName = (code: string): string => {
    const country = getCountryByCode(code)
    return country?.name || code
  }

  return {
    getAllCountries,
    getCountryByCode,
    getRegions,
    getSubregions,
    formatNumber,
    formatArea,
    getCountryName,
  }
}
