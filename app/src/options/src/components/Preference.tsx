function Preference({ label, type, id, value, onChange }) {
  let inputElement;
  switch (type) {
    case "switch":
      inputElement = (
        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
          <input
            type="checkbox"
            id={id}
            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <label
            htmlFor={id}
            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${value ? "bg-green-500" : "bg-gray-300"}`}
          />
        </div>
      );
      break;
    case "text":
      inputElement = (
        <input
          type="text"
          id={id}
          className="border rounded-md p-2 w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "numeric":
      inputElement = (
        <div className="flex items-center border rounded-md">
          <button className="p-2" onClick={() => onChange(value - 1)}>
            {"<"}
          </button>
          <input
            type="text"
            id={id}
            className="text-center p-2 w-20 border-none"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <button className="p-2" onClick={() => onChange(value + 1)}>
            {">"}
          </button>
        </div>
      );
      break;
    default:
      inputElement = null;
  }

  return (
    <label className="flex justify-between items-center py-2">
      <span className="text-lg">{label}</span>
      {inputElement}
    </label>
  );
}

export default Preference;
