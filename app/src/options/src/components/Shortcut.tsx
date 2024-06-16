function Shortcut({ label, id, value }) {
  return (
    <label className="flex justify-between items-center py-2">
      <span className="text-lg">{label}</span>
      <input
        type="text"
        id={id}
        placeholder="Press a key"
        className="border rounded-md p-2 text-center"
        value={value}
      />
    </label>
  );
}

export default Shortcut;
