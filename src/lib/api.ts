import { create } from "zustand";

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || "";

export interface FSItem {
  id: string;
  uid: string;
  name: string;
  path: string;
  is_dir: boolean;
  parent_id: string;
  parent_uid: string;
  created: number;
  modified: number;
  accessed: number;
  size: number | null;
  writable: boolean;
}

export interface User {
  uuid: string;
  username: string;
}

export interface TrialInfo {
  used: number;
  remaining: number;
  max: number;
}

export interface KVItem {
  key: string;
  value: string;
}

interface ChatMessageContent {
  type: "file" | "text";
  file_path?: string;
  text?: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | ChatMessageContent[];
}

interface ChatOptions {
  model?: string;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  tools?: {
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: { type: string; properties: object };
    };
  }[];
}

interface AIResponse {
  index: number;
  message: {
    role: string;
    content: string | unknown[];
    refusal: null | string;
    annotations: unknown[];
  };
  logprobs: null | unknown;
  finish_reason: string;
  usage: {
    type: string;
    model: string;
    amount: number;
    cost: number;
  }[];
  via_ai_chat_service: boolean;
}

interface ApiStore {
  isLoading: boolean;
  error: string | null;
  apiReady: boolean;
  trial: TrialInfo;
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
    getUser: () => User | null;
    getTrial: () => TrialInfo;
    canUseFreeTrial: () => boolean;
  };
  fs: {
    write: (
      path: string,
      data: string | File | Blob
    ) => Promise<File | Record<string, unknown> | undefined>;
    read: (path: string) => Promise<Blob | undefined>;
    upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;
    delete: (path: string) => Promise<void>;
    readDir: (path: string) => Promise<FSItem[] | undefined>;
  };
  ai: {
    chat: (
      prompt: string | ChatMessage[],
      imageURL?: string | ChatOptions,
      testMode?: boolean,
      options?: ChatOptions
    ) => Promise<AIResponse | undefined>;
    feedback: (
      path: string,
      message: string
    ) => Promise<{ success: boolean; feedback: string } | undefined>;
    img2txt: (
      image: string | File | Blob,
      testMode?: boolean
    ) => Promise<string | undefined>;
    convertToMarkdown: (resumeText: string) => Promise<string | undefined>;
    rebuildResume: (
      resumeText: string,
      feedback: unknown,
      jobDescription?: string
    ) => Promise<string | undefined>;
  };
  kv: {
    get: (key: string) => Promise<string | null | undefined>;
    set: (key: string, value: string) => Promise<boolean | undefined>;
    delete: (key: string) => Promise<boolean | undefined>;
    list: (
      pattern: string,
      returnValues?: boolean
    ) => Promise<string[] | KVItem[] | undefined>;
    flush: () => Promise<boolean | undefined>;
  };

  init: () => void;
  clearError: () => void;
}

const DEFAULT_TRIAL: TrialInfo = { used: 0, remaining: 3, max: 3 };

export const useApiStore = create<ApiStore>((set, get) => {
  const setError = (msg: string | null) => {
    set({ error: msg, isLoading: false });
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/auth/status`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Auth status failed");
      const json = await res.json();
      const isAuthenticated = Boolean(json?.isAuthenticated);
      const trialInfo: TrialInfo = json.trial ?? DEFAULT_TRIAL;
      set({
        auth: {
          user: json.user ?? null,
          isAuthenticated,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => get().auth.user,
          getTrial: () => get().trial,
          canUseFreeTrial: () => get().trial.remaining > 0,
        },
        trial: trialInfo,
        isLoading: false,
      });
      return isAuthenticated;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to check auth status");
      return false;
    }
  };

  const signIn = async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const next = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      window.location.href = `/login?next=${next}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    }
  };

  const signOut = async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      await fetch(`${API_BASE}/api/auth/signout`, {
        method: "POST",
        credentials: "include",
      });
      set({
        auth: {
          user: null,
          isAuthenticated: false,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => null,
          getTrial: () => DEFAULT_TRIAL,
          canUseFreeTrial: () => false,
        },
        trial: DEFAULT_TRIAL,
        isLoading: false,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign out failed");
    }
  };

  const refreshUser = async (): Promise<void> => {
    await checkAuthStatus();
  };

  const upload = async (files: File[] | Blob[]) => {
    try {
      const form = new FormData();
      for (const f of files as File[]) form.append("files", f);
      const res = await fetch(`${API_BASE}/api/files?action=upload`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      return (await res.json()) as FSItem;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return undefined;
    }
  };

  const readFile = async (path: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/files?action=read&path=${encodeURIComponent(path)}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Read failed");
      const blob = await res.blob();
      return blob;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Read file failed");
      return undefined;
    }
  };

  const write = async (path: string, data: string | File | Blob) => {
    try {
      const form = new FormData();
      form.append("path", path);
      if (data instanceof File || data instanceof Blob) {
        form.append("file", data);
      } else {
        form.append("content", data);
      }
      const res = await fetch(`${API_BASE}/api/files?action=write`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Write failed");
      return (await res.json()) as Record<string, unknown>;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Write failed");
      return undefined;
    }
  };

  const deleteFile = async (path: string) => {
    try {
      await fetch(`${API_BASE}/api/files?action=delete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const readDir = async (path: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/files?action=list&path=${encodeURIComponent(path)}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("List failed");
      return (await res.json()) as FSItem[];
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ReadDir failed");
      return undefined;
    }
  };

  const chatAi = async (
    prompt: string | ChatMessage[],
    imageURL?: string | ChatOptions,
    testMode?: boolean,
    options?: ChatOptions
  ) => {
    try {
      const res = await fetch(`${API_BASE}/api/ai?action=chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, imageURL, testMode, options }),
      });
      if (!res.ok) throw new Error("AI chat failed");
      const json = await res.json();
      return (json.response ?? json) as AIResponse;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "AI chat failed");
      return undefined;
    }
  };

  const feedback = async (resumeText: string, instructions: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/ai?action=feedback`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          section: "full",
          question: instructions,
        }),
      });
      if (!res.ok) throw new Error("AI feedback failed");
      return (await res.json()) as { success: boolean; feedback: string };
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "AI feedback failed");
      return undefined;
    }
  };

  const img2txt = async (image: string | File | Blob, testMode?: boolean) => {
    try {
      const form = new FormData();
      if (image instanceof File || image instanceof Blob) {
        const filename = image instanceof File ? image.name : "image.png";
        form.append("image", image, filename);
      } else {
        form.append("imageUrl", image);
      }
      if (testMode !== undefined) {
        form.append("testMode", String(testMode));
      }
      const res = await fetch(`${API_BASE}/api/ai?action=img2txt`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!res.ok) throw new Error("img2txt failed");
      const result = await res.json();
      return result.text || (result.success ? result.text : undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "img2txt failed");
      return undefined;
    }
  };

  const convertToMarkdown = async (
    resumeText: string
  ): Promise<string | undefined> => {
    try {
      const res = await fetch(`${API_BASE}/api/ai?action=convert-to-markdown`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      if (!res.ok) throw new Error("Failed to convert to markdown");
      const result = await res.json();
      return result.markdown;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to convert to markdown"
      );
      return undefined;
    }
  };

  const rebuildResume = async (
    resumeText: string,
    feedback: unknown,
    jobDescription?: string
  ): Promise<string | undefined> => {
    try {
      const res = await fetch(`${API_BASE}/api/ai?action=rebuild-resume`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, feedback, jobDescription }),
      });
      if (!res.ok) throw new Error("Failed to rebuild resume");
      const result = await res.json();
      return result.rebuiltResume;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to rebuild resume");
      return undefined;
    }
  };

  const getKV = async (key: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/kv?action=get&key=${encodeURIComponent(key)}`,
        { credentials: "include" }
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json?.value ?? null;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "KV get failed");
      return null;
    }
  };

  const setKV = async (key: string, value: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/kv?action=set`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      return res.ok;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "KV set failed");
      return undefined;
    }
  };

  const deleteKV = async (key: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/kv?action=delete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      return res.ok;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "KV delete failed");
      return undefined;
    }
  };

  const listKV = async (pattern: string, returnValues?: boolean) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/kv?action=list&pattern=${encodeURIComponent(
          pattern
        )}&values=${!!returnValues}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("KV list failed");
      const json = await res.json();
      return (json?.items || []) as string[] | KVItem[];
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "KV list failed");
      return undefined;
    }
  };

  const flushKV = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kv?action=flush`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "KV flush failed");
      return undefined;
    }
  };

  const init = () => {
    checkAuthStatus();
  };

  return {
    isLoading: true,
    error: null,
    apiReady: true,
    trial: DEFAULT_TRIAL,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signOut,
      refreshUser,
      checkAuthStatus,
      getUser: () => get().auth.user,
      getTrial: () => get().trial,
      canUseFreeTrial: () => get().trial.remaining > 0,
    },
    fs: {
      write,
      read: readFile,
      readDir,
      upload,
      delete: deleteFile,
    },
    ai: {
      chat: chatAi,
      feedback,
      img2txt,
      convertToMarkdown,
      rebuildResume,
    },
    kv: {
      get: getKV,
      set: setKV,
      delete: deleteKV,
      list: listKV,
      flush: flushKV,
    },
    init,
    clearError: () => set({ error: null }),
  };
});
