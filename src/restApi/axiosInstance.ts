import axios from "axios";
import qs from "qs";
import { notification } from "antd";

const axiosInstance = axios.create({
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

if (typeof window !== "undefined") {
  axiosInstance.interceptors.response.use(
    (response) => {
      // Blob / ArrayBuffer 等二进制响应直接放行，不做 code 判断
      if (
        response.config?.responseType === "blob" ||
        response.config?.responseType === "arraybuffer" ||
        response.data instanceof Blob
      ) {
        return response;
      }

      const { code, message } = response.data;
      if (code === 200) return response;

      if (code === 401) {
        window.location.href = "/login";
      } else {
        notification.error({ message });
      }
      return Promise.reject(new Error(message));
    },
    (err) => {
      notification.error({ message: "服务器异常" });
      return Promise.reject(err);
    }
  );
}

export default axiosInstance;
