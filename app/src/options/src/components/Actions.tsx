function Actions({ onSave, onRestoreDefaults }) {
  return (
    <section className="flex space-x-4 mt-8">
      <button className="bg-blue-500 text-white py-2 px-4 rounded-md" id="save">
        Save
      </button>
      <button
        className="bg-gray-500 text-white py-2 px-4 rounded-md"
        id="restore"
      >
        Restore Defaults
      </button>
      <div id="status" className="text-gray-500 text-sm"></div>
    </section>
  );
}

export default Actions;
