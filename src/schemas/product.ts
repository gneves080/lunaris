import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Informe o nome do produto.'),
  description: z.string().min(5, 'Descreva o produto.'),
  category: z.string().min(2, 'Selecione uma categoria.'),
  price: z.coerce.number().min(0, 'O preço não pode ser negativo.'),
  cost: z.coerce.number().min(0, 'O custo não pode ser negativo.'),
  unit: z.string().default('un'),
  status: z.enum(['active', 'inactive']).default('active'),
})

export type ProductFormValues = z.infer<typeof productSchema>
