/** Roles permitidos en el sistema. */
export type UserRole = 'admin' | 'user' | 'moderator';

/** Entidad de usuario devuelta por la API. */
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Payload para crear un usuario (POST). */
export interface UserCreate {
  username: string;
  email: string;
  full_name: string;
  role?: UserRole;
  is_active?: boolean;
}

/** Payload para actualización parcial de usuario (PATCH). */
export interface UserUpdate {
  username?: string;
  email?: string;
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

/** Respuesta paginada genérica de la API. */
export interface PaginatedResponse<T> {
  total: number;
  skip: number;
  limit: number;
  data: T[];
}

/** Parámetros de paginación para el listado. */
export interface UserListParams {
  skip?: number;
  limit?: number;
}
