import { z } from "zod";

// Schema para criação de WorkEntries
export const WorkEntriesCreateSchema = z.object({
  userId: z.number(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  hours: z.number().positive("Horas devem ser um número positivo"),
  amount: z.number().optional(),
  description: z.string().optional()
});

// Schema para atualização de WorkEntries (todos os campos opcionais)
export const WorkEntriesUpdateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").optional(),
  hours: z.number().positive("Horas devem ser um número positivo").optional(),
  amount: z.number().positive("Valor deve ser um número positivo").optional(),
  description: z.string().optional()
});

// Schema para validação de query params (ex: listagem de TimeEntries)
export const WorkEntriesQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").optional()
});