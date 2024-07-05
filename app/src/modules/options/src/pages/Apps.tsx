import AppsConfig from "../components/Apps";

export default function Apps() {
  return (
    <div className="p-6">
      <h1 className="text-gray-300 text-4xl font-bold mb-4">Apps</h1>
      <h2 className="text-gray-400 text-[12px] mb-8">
        Manage your web apps settings and preferences
      </h2>
      <hr className="mb-8 border-gray-600/30" />
      <AppsConfig />
    </div>
  );
}
