import { createAdminClient } from "@/lib/supabase/admin";
import { v4 as uuidv4 } from "uuid";

const BUCKET = "resumes";

export interface FileMetadata {
  id: string;
  name: string;
  path: string;
  size: number;
  contentType: string;
  url: string;
  created: Date;
  updated: Date;
}

function getAdmin() {
  try {
    return createAdminClient();
  } catch {
    throw new Error(
      "Supabase storage not configured (SUPABASE_SERVICE_ROLE_KEY)"
    );
  }
}

export async function uploadFile(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string,
       userId?: string,
  folder?: string,
  _maxRetries: number = 3
): Promise<FileMetadata> {
  const admin = getAdmin();
  const buf = Buffer.isBuffer(file) ? file : Buffer.from(file);

  if (!buf.length) {
    throw new Error("File data is empty or invalid");
  }
  if (!fileName) {
    throw new Error("File name is required");
  }

  const fileId = uuidv4();
  const extension = fileName.split(".").pop() || "bin";
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uid = userId || "anonymous";
  const folderPath = folder ? `${folder}/` : "";
  const filePath = `${uid}/${folderPath}${fileId}.${extension}`;

  const { error } = await admin.storage.from(BUCKET).upload(filePath, buf, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return {
    id: fileId,
    name: sanitizedName,
    path: filePath,
    size: buf.length,
    contentType,
    url: `supabase://${BUCKET}/${filePath}`,
    created: new Date(),
    updated: new Date(),
  };
}

export async function readFile(filePath: string): Promise<Buffer> {
  const admin = getAdmin();
  const { data, error } = await admin.storage.from(BUCKET).download(filePath);
  if (error || !data) {
    throw new Error(error?.message || "File not found");
  }
  return Buffer.from(await data.arrayBuffer());
}

export async function getFileMetadata(
  filePath: string
): Promise<FileMetadata | null> {
  const admin = getAdmin();
  const folder = filePath.includes("/")
    ? filePath.slice(0, filePath.lastIndexOf("/"))
    : "";
  const name = filePath.split("/").pop() || filePath;
  const { data, error } = await admin.storage.from(BUCKET).list(folder, {
    search: name,
  });

  if (error || !data?.length) {
    return null;
  }

  const meta = data.find((o) => o.name === name) ?? data[0];
  return {
    id: meta.id ?? filePath,
    name: meta.name,
    path: filePath,
    size: Number(meta.metadata?.size ?? 0),
    contentType:
      (meta.metadata?.mimetype as string) || "application/octet-stream",
    url: `supabase://${BUCKET}/${filePath}`,
    created: new Date(meta.created_at ?? Date.now()),
    updated: new Date(meta.updated_at ?? meta.created_at ?? Date.now()),
  };
}

export async function deleteFile(filePath: string): Promise<void> {
  const admin = getAdmin();
  await admin.storage.from(BUCKET).remove([filePath]);
}

export async function listFiles(
  userId?: string,
  folder?: string,
  limit?: number
): Promise<FileMetadata[]> {
  const admin = getAdmin();
  const listPath = userId
    ? folder
      ? `${userId}/${folder.replace(/^\/|\/$/g, "")}`
      : userId
    : "anonymous";
  const { data, error } = await admin.storage.from(BUCKET).list(listPath, {
    limit: limit ?? 1000,
  });
  if (error || !data) {
    return [];
  }
  return data.map((o) => ({
    id: o.id ?? o.name,
    name: o.name,
    path: `${listPath}/${o.name}`,
    size: Number(o.metadata?.size ?? 0),
    contentType:
      (o.metadata?.mimetype as string) || "application/octet-stream",
    url: `supabase://${BUCKET}/${listPath}/${o.name}`,
    created: new Date(o.created_at ?? Date.now()),
    updated: new Date(o.updated_at ?? o.created_at ?? Date.now()),
  }));
}

export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const admin = getAdmin();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(filePath, expiresIn);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Could not sign URL");
  }
  return data.signedUrl;
}

export async function copyFile(
  _sourcePath: string,
  _destinationPath: string
): Promise<void> {
  throw new Error("copyFile not implemented for Supabase storage");
}

export async function moveFile(
  _sourcePath: string,
  _destinationPath: string
): Promise<void> {
  throw new Error("moveFile not implemented for Supabase storage");
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function getFileSize(filePath: string): Promise<number> {
  const meta = await getFileMetadata(filePath);
  return meta?.size ?? 0;
}

export async function makeFilePublic(_filePath: string): Promise<string> {
  throw new Error("Public URLs not used; use getSignedUrl");
}

export async function makeFilePrivate(_filePath: string): Promise<void> {
  /* private bucket */
}
