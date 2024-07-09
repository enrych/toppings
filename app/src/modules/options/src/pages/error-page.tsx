import { useRouteError } from "react-router-dom";

type RouteError = {
  statusText?: string;
  message?: string;
};

export default function ErrorPage() {
  const error = useRouteError() as RouteError;
  console.error(error);

  const handleFileIssue = () => {
    window.open("https://github.com/enrych/toppings/issues", "_blank");
  };

  return (
    <div
      id="error-page"
      className="bg-[#0f0f10] text-[#e7e7e4] flex flex-col items-center justify-center min-h-screen"
    >
      <div className="p-8 rounded shadow-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-lg mb-4">Sorry, an unexpected error has occurred.</p>
        <p className="text-sm text-gray-500 mb-4">
          <i>{error.statusText || error.message}</i>
        </p>
        <p className="text-sm mb-4">
          If you keep seeing this error, please{" "}
          <button
            onClick={handleFileIssue}
            className="text-blue-600 underline focus:outline-none"
          >
            file an issue
          </button>
          .
        </p>
      </div>
    </div>
  );
}
