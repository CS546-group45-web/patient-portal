import axios from "axios";
import { toast } from "react-toastify";
// const baseUrl = "http://localhost:4000/";
const baseUrl = process.env.REACT_APP_BASE_URL;

const jwtToken = localStorage.getItem("token") ?? null;
const errosStatusCodes = [500, 409, 404, 400];
export const makeApiCall = async (endpoint, method, body, headers = null) => {
  let results = {};
  try {
    await axios({
      url: baseUrl + endpoint,
      method,
      data: body,
      headers: jwtToken
        ? {
            ...headers,
            Authorization: `Bearer ${jwtToken}`,
          }
        : headers,
    }).then((res) => {
      const { data, status } = res;
      results.data = data;
      results.status = status;
    });
    return results;
  } catch (err) {
    const { response } = err;
    if (errosStatusCodes.includes(response?.status))
      return toast.error(response?.data?.error);
    if (response?.status === 401) setTimeout(logoutUser, 3000);
    toast.error("Something went wrong!");
    setTimeout(logoutUser, 4000);
  }
};

const logoutUser = () => {
  localStorage.removeItem("auth");
  localStorage.removeItem("token");
  window.location.href = "/login";
  return;
};
