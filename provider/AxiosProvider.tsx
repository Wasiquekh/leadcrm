import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosHeaders, // ✅ use the class
} from "axios";
import StorageManager from "./StorageManager";

const defaultBaseURL =
  "https://manageleadcrmbackend.dynsimulation.com/api/v1/managelead";

export default class AxiosProvider {
  private instance: AxiosInstance;
  defaults: any;

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_URL || defaultBaseURL
  ) {
    this.instance = axios.create({ baseURL });

    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Ensure we have an AxiosHeaders instance
        const headers =
          config.headers instanceof AxiosHeaders
            ? config.headers
            : new AxiosHeaders(config.headers);

        // Add token
        if (typeof window !== "undefined") {
          const storage = new StorageManager();
          let token = storage.getAccessToken?.() || "";
          if (token.startsWith("Bearer ")) token = token.slice(7).trim();
          if (token) headers.set("Authorization", `Bearer ${token}`);
        }

        // Defaults (only if not already set)
        if (!headers.has("Accept")) headers.set("Accept", "application/json");
        if (!headers.has("Content-Type"))
          headers.set("Content-Type", "application/json");

        config.headers = headers; // ✅ typed: AxiosHeaders satisfies AxiosRequestHeaders
        return config;
      }
    );

    this.instance.interceptors.response.use(
      (res) => res,
      (err) => Promise.reject(err)
    );
  }

  get<T = any>(url: string, config?: InternalAxiosRequestConfig) {
    return this.instance.get<T>(url, config);
  }
  post<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig) {
    return this.instance.post<T>(url, data, config);
  }
  put<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig) {
    return this.instance.put<T>(url, data, config);
  }
  delete<T = any>(url: string, config?: InternalAxiosRequestConfig) {
    return this.instance.delete<T>(url, config);
  }
}
