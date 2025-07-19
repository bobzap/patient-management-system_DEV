// src/components/ui/enhanced-select.tsx
"use client"

import * as React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Check, ChevronDown, Plus, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLists } from "@/hooks/useLists"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface EnhancedSelectProps {
  listType: string
  
  // Sélection simple
  value?: string
  onValueChange?: (value: string) => void
  
  // Sélection multiple
  multiple?: boolean
  values?: string[]
  onValuesChange?: (values: string[]) => void
  
  // Configuration
  placeholder?: string
  searchable?: boolean
  customizable?: boolean
  disabled?: boolean
  className?: string
  
  // Affichage
  showSelectedPanel?: boolean
  badgeActions?: boolean
}

export const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  listType,
  value,
  onValueChange,
  multiple = false,
  values = [],
  onValuesChange,
  placeholder = "Sélectionner...",
  searchable = true,
  customizable = true,
  disabled = false,
  className,
  showSelectedPanel = false,
  badgeActions = true
}) => {
  const { lists, isLoading, error, refreshLists } = useLists()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemValue, setNewItemValue] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [localAddedItems, setLocalAddedItems] = useState<string[]>([])

  // Fonction de tri intelligent optimisée avec mémorisation
  const smartSort = useCallback((items: string[]): string[] => {
    return items.sort((a, b) => {
      // Cache pour éviter les regex multiples
      const aNumMatch = a.match(/^(\d+)/)
      const bNumMatch = b.match(/^(\d+)/)
      
      // Si les deux commencent par des chiffres
      if (aNumMatch && bNumMatch) {
        const aNum = parseInt(aNumMatch[1], 10)
        const bNum = parseInt(bNumMatch[1], 10)
        
        if (aNum !== bNum) {
          return bNum - aNum // Du plus grand au plus petit
        }
        // Si même nombre, tri alphabétique du reste
        return a.localeCompare(b, 'fr', { sensitivity: 'base' })
      }
      
      // Si seulement A commence par un chiffre
      if (aNumMatch && !bNumMatch) {
        return -1 // A avant B
      }
      
      // Si seulement B commence par un chiffre
      if (!aNumMatch && bNumMatch) {
        return 1 // B avant A
      }
      
      // Caractères spéciaux avant lettres (optimisé)
      const aFirstChar = a.charCodeAt(0)
      const bFirstChar = b.charCodeAt(0)
      
      const aIsSpecial = aFirstChar < 48 || (aFirstChar > 57 && aFirstChar < 65) || (aFirstChar > 90 && aFirstChar < 97) || aFirstChar > 122
      const bIsSpecial = bFirstChar < 48 || (bFirstChar > 57 && bFirstChar < 65) || (bFirstChar > 90 && bFirstChar < 97) || bFirstChar > 122
      
      if (aIsSpecial && !bIsSpecial) return -1
      if (!aIsSpecial && bIsSpecial) return 1
      
      // Sinon tri alphabétique standard
      return a.localeCompare(b, 'fr', { sensitivity: 'base' })
    })
  }, [])

  // Récupérer les items de la liste + items ajoutés localement
  const items = useMemo(() => {
    const baseItems = lists[listType] || []
    const allItems = [...baseItems, ...localAddedItems]
    const uniqueItems = [...new Set(allItems)]
    return smartSort(uniqueItems)
  }, [lists, listType, localAddedItems])

  // Nettoyer les items locaux quand ils sont maintenant dans les listes officielles
  useEffect(() => {
    const baseItems = lists[listType] || []
    if (baseItems.length > 0 && localAddedItems.length > 0) {
      const itemsToRemove = localAddedItems.filter(item => baseItems.includes(item))
      if (itemsToRemove.length > 0) {
        setLocalAddedItems(prev => 
          prev.filter(item => !baseItems.includes(item))
        )
      }
    }
  }, [lists, listType]) // Se déclencher seulement quand les listes officielles changent

  // Filtrer les items selon le terme de recherche (sécurisé)
  const filteredItems = useMemo(() => {
    if (!searchTerm || !searchable) return items
    
    // Sanitiser le terme de recherche
    const sanitizedSearchTerm = searchTerm
      .trim()
      .replace(/[<>\"']/g, '')
      .substring(0, 50) // Limiter la recherche à 50 caractères
      .toLowerCase()
    
    if (!sanitizedSearchTerm) return items
    
    return items.filter(item => {
      try {
        return item.toLowerCase().includes(sanitizedSearchTerm)
      } catch (error) {
        console.warn('Erreur lors du filtrage:', error)
        return false
      }
    })
  }, [items, searchTerm, searchable])

  // Gérer la sélection multiple (optimisé)
  const handleMultipleSelect = useCallback((itemValue: string) => {
    if (!multiple || !onValuesChange || !itemValue?.trim()) return
    
    const currentValues = values || []
    const isSelected = currentValues.includes(itemValue)
    
    if (isSelected) {
      // Retirer l'item
      onValuesChange(currentValues.filter(v => v !== itemValue))
    } else {
      // Ajouter l'item
      onValuesChange([...currentValues, itemValue])
    }
  }, [multiple, onValuesChange, values])

  // Validation et nettoyage sécurisé des entrées
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>\"']/g, '') // Supprimer caractères potentiellement dangereux
      .substring(0, 100) // Limiter à 100 caractères
  }

  // Ajouter un nouvel item personnalisé avec mise à jour locale
  const addCustomItem = async () => {
    if (!newItemValue.trim() || isAddingItem) return

    const sanitizedValue = sanitizeInput(newItemValue)
    
    // Vérifications de sécurité
    if (!sanitizedValue || sanitizedValue.length < 1) {
      console.warn('Valeur invalide après sanitisation')
      return
    }
    
    // Vérifier si l'item existe déjà
    if (items.includes(sanitizedValue)) {
      console.warn('Cet item existe déjà')
      return
    }

    setIsAddingItem(true)
    
    try {
      // 1. Ajouter localement à la liste des items ajoutés
      setLocalAddedItems(prev => {
        if (prev.includes(sanitizedValue)) return prev
        return [...prev, sanitizedValue]
      })
      
      // 2. Sélectionner immédiatement la nouvelle valeur
      if (multiple && onValuesChange) {
        const currentValues = values || []
        onValuesChange([...currentValues, sanitizedValue])
      } else if (onValueChange) {
        onValueChange(sanitizedValue)
      }
      
      // 3. Réinitialiser le formulaire immédiatement
      setNewItemValue("")
      setShowAddForm(false)
      setSearchTerm("")
      
      // 4. Envoyer la requête à l'API en arrière-plan (sécurisé)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // Timeout 10s
      
      fetch(`/api/lists/${encodeURIComponent(listType)}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: sanitizedValue
        }),
        signal: controller.signal
      }).then(response => {
        clearTimeout(timeoutId)
        if (!response.ok) {
          console.error('Erreur lors de la sauvegarde en base')
        }
      }).catch(error => {
        clearTimeout(timeoutId)
        if (error.name !== 'AbortError') {
          console.error('Erreur réseau lors de l\'ajout:', error)
        }
      })
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
    } finally {
      setIsAddingItem(false)
    }
  }

  // Gérer l'annulation de l'ajout (optimisé)
  const cancelAdd = useCallback(() => {
    setNewItemValue("")
    setShowAddForm(false)
    setSearchTerm("")
  }, [])

  if (isLoading) {
    return (
      <div className={cn("h-10 w-full animate-pulse rounded-md bg-muted", className)} />
    )
  }

  if (error) {
    return (
      <div className={cn("h-10 w-full rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive", className)}>
        Erreur de chargement
      </div>
    )
  }

  if (multiple) {
    // Mode sélection multiple
    return (
      <div className="w-full space-y-2">
        {/* Badges des items sélectionnés */}
        {values && values.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.map((selectedValue) => (
              <div
                key={selectedValue}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors duration-200"
              >
                <span>{selectedValue}</span>
                {badgeActions && (
                  <button
                    onClick={() => handleMultipleSelect(selectedValue)}
                    className="ml-1 text-blue-600 hover:text-blue-800 hover:bg-blue-300 rounded-full p-0.5 transition-all duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Dropdown pour ajouter des items */}
        <Select
          value=""
          onValueChange={handleMultipleSelect}
          disabled={disabled}
        >
          <SelectTrigger className={`${className} hover:bg-gray-50 transition-colors duration-200`}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {/* Barre de recherche */}
            {searchable && (
              <div className="sticky top-0 z-10 bg-popover p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 transition-colors duration-200" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      // Empêcher TOUTES les touches de naviguer dans le Select
                      e.stopPropagation()
                      
                      // Permettre seulement certaines touches de navigation
                      if (e.key === 'Escape') {
                        setSearchTerm('')
                      }
                    }}
                    onFocus={(e) => {
                      // Empêcher le focus de déclencher la navigation Radix
                      e.stopPropagation()
                    }}
                    className="pl-8 h-8 placeholder:text-gray-400 placeholder:font-light focus:placeholder:text-gray-300 transition-all duration-300 hover:bg-gray-50"
                  />
                </div>
              </div>
            )}

            {/* Formulaire d'ajout */}
            {customizable && showAddForm && (
              <div className="sticky top-0 z-10 bg-popover p-2 border-b border-gray-100">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nouvelle valeur..."
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(e.target.value)}
                    onKeyDown={(e) => {
                      // Empêcher TOUTES les touches de naviguer dans le Select
                      e.stopPropagation()
                      
                      if (e.key === 'Enter') {
                        addCustomItem()
                      } else if (e.key === 'Escape') {
                        cancelAdd()
                      }
                    }}
                    onFocus={(e) => {
                      e.stopPropagation()
                    }}
                    autoFocus
                    className="h-8 placeholder:text-gray-400 placeholder:font-light focus:placeholder:text-gray-300 transition-all duration-300"
                    disabled={isAddingItem}
                  />
                  <Button
                    size="sm"
                    onClick={addCustomItem}
                    disabled={!newItemValue.trim() || isAddingItem}
                    className="h-8 px-2 hover:bg-green-600 transition-colors duration-200"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelAdd}
                    className="h-8 px-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Items de la liste */}
            {filteredItems.map((item) => {
              const isSelected = values?.includes(item)
              return (
                <SelectItem key={item} value={item}>
                  <div className="flex items-center justify-between w-full">
                    <span className={isSelected ? 'font-semibold text-blue-600' : ''}>{item}</span>
                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                  </div>
                </SelectItem>
              )
            })}

            {/* Message si aucun résultat */}
            {searchable && searchTerm && filteredItems.length === 0 && (
              <div className="p-4 text-sm text-gray-500 text-center font-light">
                Aucun résultat trouvé
              </div>
            )}

            {/* Bouton d'ajout */}
            {customizable && !showAddForm && (
              <div className="sticky bottom-0 z-10 bg-popover p-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="w-full h-8 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une valeur
                </Button>
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    )
  }

  // Mode sélection simple (existant)
  return (
    <div className="w-full">
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={`${className} hover:bg-gray-50 transition-colors duration-200`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* Barre de recherche */}
          {searchable && (
            <div className="sticky top-0 z-10 bg-popover p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 transition-colors duration-200" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    // Empêcher TOUTES les touches de naviguer dans le Select
                    e.stopPropagation()
                    
                    // Permettre seulement certaines touches de navigation
                    if (e.key === 'Escape') {
                      setSearchTerm('')
                    }
                  }}
                  onFocus={(e) => {
                    // Empêcher le focus de déclencher la navigation Radix
                    e.stopPropagation()
                  }}
                  className="pl-8 h-8 placeholder:text-gray-400 placeholder:font-light focus:placeholder:text-gray-300 transition-all duration-300 hover:bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* Formulaire d'ajout */}
          {customizable && showAddForm && (
            <div className="sticky top-0 z-10 bg-popover p-2 border-b border-gray-100">
              <div className="flex gap-2">
                <Input
                  placeholder="Nouvelle valeur..."
                  value={newItemValue}
                  onChange={(e) => setNewItemValue(e.target.value)}
                  onKeyDown={(e) => {
                    // Empêcher TOUTES les touches de naviguer dans le Select
                    e.stopPropagation()
                    
                    if (e.key === 'Enter') {
                      addCustomItem()
                    } else if (e.key === 'Escape') {
                      cancelAdd()
                    }
                  }}
                  onFocus={(e) => {
                    e.stopPropagation()
                  }}
                  autoFocus
                  className="h-8 placeholder:text-gray-400 placeholder:font-light focus:placeholder:text-gray-300 transition-all duration-300"
                  disabled={isAddingItem}
                />
                <Button
                  size="sm"
                  onClick={addCustomItem}
                  disabled={!newItemValue.trim() || isAddingItem}
                  className="h-8 px-2 hover:bg-green-600 transition-colors duration-200"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelAdd}
                  className="h-8 px-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Items de la liste */}
          {filteredItems.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}

          {/* Message si aucun résultat */}
          {searchable && searchTerm && filteredItems.length === 0 && (
            <div className="p-4 text-sm text-gray-500 text-center font-light">
              Aucun résultat trouvé
            </div>
          )}

          {/* Bouton d'ajout */}
          {customizable && !showAddForm && (
            <div className="sticky bottom-0 z-10 bg-popover p-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="w-full h-8 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une valeur
              </Button>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

export default EnhancedSelect