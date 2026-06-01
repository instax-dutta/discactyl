export interface PterodactylError {
  status: number;
  code: string;
  detail: string;
  isRateLimit: boolean;
  isNotFound: boolean;
  isUnauthorized: boolean;
  isValidation: boolean;
}

export interface PaginationMeta {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface ServerAttributes {
  id: number;
  uuid: string;
  identifier: string;
  name: string;
  status: string | null;
  node: number;
  allocation: number;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
  };
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  user: number;
}

export interface UserAttributes {
  id: number;
  uuid: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  language: string;
  root_admin: boolean;
  '2fa': boolean;
  created_at: string;
  updated_at: string;
}

export interface NodeAttributes {
  id: number;
  name: string;
  location_id: number;
  fqdn: string;
  scheme: string;
  memory: number;
  memory_overallocate: number;
  disk: number;
  disk_overallocate: number;
  upload_size: number;
  maintenance_mode: boolean;
}

export interface AllocationAttributes {
  id: number;
  ip: string;
  port: number;
  assigned: boolean;
}

export interface ClientServerAttributes {
  server_owner: boolean;
  identifier: string;
  uuid: string;
  name: string;
  node: string;
  is_suspended: boolean;
  is_installing: boolean;
}

export interface ServerResources {
  current_state: string;
  is_suspended: boolean;
  resources: {
    memory_bytes: number;
    cpu_absolute: number;
    disk_bytes: number;
    network_rx_bytes: number;
    network_tx_bytes: number;
    uptime: number;
  };
}

export interface BackupAttributes {
  uuid: string;
  name: string | null;
  bytes: number;
  checksum: string | null;
  is_successful: boolean;
  is_locked: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface AccountAttributes {
  id: number;
  admin: boolean;
  username: string;
  email: string;
}

export interface ApiListResponse<T> {
  object: string;
  data: Array<{ object: string; attributes: T }>;
  meta: { pagination: PaginationMeta };
}
