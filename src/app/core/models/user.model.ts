/** Roles permitidos en el sistema (debe coincidir con UserRole del backend). */
export type UserRole = 'admin' | 'user' | 'guest';

/** Patrón RemoteData — encapsula el ciclo de vida completo de una petición asíncrona. */
export type RemoteData<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

/** Entidad de usuario devuelta por la API. Refleja UserResponse del backend. */
export interface User {
  id: string;           // UUID
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** Payload para crear un usuario (POST /users). */
export interface UserCreate {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: UserRole;
  active?: boolean;
}

/** Payload para actualización de usuario (PUT /users/:id) — reemplazo completo. */
export interface UserUpdate {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  active?: boolean;
}

/** Payload para actualización parcial (PATCH /users/:id) — campos modificables sin PUT. */
export type UserPatch = Partial<Pick<UserCreate, 'active' | 'role' | 'username'>>;

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
