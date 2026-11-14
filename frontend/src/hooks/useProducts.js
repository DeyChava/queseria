import { useContext } from 'react'
import { ProductsContext } from '../context/contexts'

// Uso: const { productos, cargando, error, cargar, guardar, eliminar, ajustar } = useProducts()
export const useProducts = () => useContext(ProductsContext)
