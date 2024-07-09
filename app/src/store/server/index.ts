const SERVER_BASE_URI =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://toppings.onrender.com";

export default SERVER_BASE_URI;
