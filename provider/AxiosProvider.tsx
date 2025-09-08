import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const isServer = typeof window === "undefined";
const defaultBaseURL =
  "https://manageleadcrmbackend.dynsimulation.com/api/v1/managelead";

export default class AxiosProvider {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = defaultBaseURL) {
    this.baseURL = isServer
      ? process.env.NEXT_PUBLIC_API_URL || baseURL // server-side
      : baseURL; // client-side

    this.instance = axios.create({
      baseURL: this.baseURL,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // Request interceptor (no auth headers; just pass through)
    this.instance.interceptors.request.use(
      this.handleRequest.bind(this),
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleError.bind(this)
    );
  }

  private async handleRequest(
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> {
    // No tokens or extra headers — pass through unchanged
    return config;
  }

  async post<T = any>(
    url: string,
    data: any,
    config?: InternalAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  async get<T = any>(
    url: string,
    config?: InternalAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  async put<T = any>(
    url: string,
    data: any,
    config?: InternalAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  async delete<T = any>(
    url: string,
    config?: InternalAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  private handleResponse(response: AxiosResponse): AxiosResponse {
    return response;
  }

  private handleError(error: any): Promise<never> {
    console.error("Error:", error);

    // ⬇️ NEW: don't redirect on 401 for the login endpoint (/sendotp)
    const url = String(error.config?.url || "");
    if (
      error.response?.status === 401 &&
      !isServer &&
      !url.endsWith("/sendotp")
    ) {
      window.location.assign("/");
      return new Promise(() => {}); // stop further handling after redirect
    }

    return Promise.reject(error);
  }
}
