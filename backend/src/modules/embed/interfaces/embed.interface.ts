/**
 * Interfaces para el módulo de Embed
 * Define los tipos de datos que se usan en el servicio y controlador
 */

/**
 * Respuesta pública de un testimonio
 * Solo contiene datos seguros para exponer a clientes externos
 */
export interface PublicTestimonialDto {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorPosition: string | null;
  authorCompany: string | null;
  rating: number | null;
  imageUrl: string | null;
  videoUrl: string | null;
  publishedAt: Date | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/**
 * Filtros para buscar testimonios
 */
export interface TestimonialFilters {
  categorySlug?: string;
  categoryIds?: string[];
  limit: number;
}

/**
 * Respuesta del endpoint de script JavaScript
 */
export interface EmbedScriptResponse {
  script: string;
  contentType: string;
}

/**
 * Respuesta al crear una API key
 */
export interface CreateApiKeyResponse {
  id: string;
  apiKey: string;
  clientName: string;
  allowedDomains: string[] | null;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  categoryId: string | null;
  message: string;
}

/**
 * Respuesta al listar API keys (sin exponer la key completa)
 */
export interface ApiKeyListItem {
  id: string;
  apiKey: string; // Mostrar solo parte: "emb_abc...xyz"
  clientName: string;
  allowedDomains: string[] | null;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  createdBy: {
    id: string;
    fullName: string;
    email: string;
  };
}

/**
 * Respuesta genérica de éxito
 */
export interface SuccessResponse {
  message: string;
}
