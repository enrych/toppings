import type { Metadata } from "next";
import { shortcuts } from "@/lib/site";

export const metadata: Metadata = { title: "Keybindings" };

export default function Keybindings() {
  return (
    <article className="prose">
      <p className="label">Reference</p>
      <h1>every key, yours to remap.</h1>
      <p className="lede">
        Defaults below. Rebind any of them from the options page. Keys only fire on{" "}
        <code>youtube.com</code>, and never while you type in a text field.
      </p>

      {shortcuts.map((group) => (
        <section key={group.group}>
          <h2>{group.group}</h2>
          <table className="keys">
            <tbody>
              {group.rows.map((row) => (
                <tr key={row.keys.join("+") + row.name}>
                  <td>
                    {row.keys.map((key, i) => (
                      <span key={key}>
                        {i > 0 && " + "}
                        <kbd>{key}</kbd>
                      </span>
                    ))}
                  </td>
                  <td>{row.name}</td>
                  <td>{row.blurb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </article>
  );
}
