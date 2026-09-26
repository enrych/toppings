import type { Metadata } from "next";
import Link from "next/link";
import { features, site } from "@/lib/site";

export const metadata: Metadata = { title: "Install" };

export default function Install() {
  return (
    <article className="prose">
      <p className="label">Getting started</p>
      <h1>install in a minute.</h1>
      <p className="lede">
        {site.name} is on the official Chrome and Firefox stores. No sideloading, no developer
        mode, no account.
      </p>

      <h2>What it does</h2>
      <ul>
        {features.map((feature) => (
          <li key={feature.name}>
            <strong>{feature.name}.</strong> {feature.blurb}
          </li>
        ))}
      </ul>

      <h2>Install</h2>
      <ol>
        <li>
          Open the{" "}
          <a href={site.chrome} target="_blank" rel="noopener noreferrer">
            Chrome Web Store
          </a>{" "}
          (Chrome, Edge, Brave, Arc, Opera) or{" "}
          <a href={site.firefox} target="_blank" rel="noopener noreferrer">
            Firefox Add-ons
          </a>
          .
        </li>
        <li>
          Click <em>Add</em>. The browser asks for two permissions: <code>youtube.com</code> access,
          to add the controls, and <code>storage</code>, to remember your settings. That is the whole
          list.
        </li>
        <li>
          Open any video and press <code>B</code> for Audio mode. Settings live in the options page:
          right-click the toolbar icon → <em>Options</em>.
        </li>
      </ol>

      <h2 id="privacy">Privacy</h2>
      <p>
        No analytics, no telemetry, no accounts. A feature may talk to our server to do its job,
        never to profile you. The source is{" "}
        <a href={site.github} target="_blank" rel="noopener noreferrer">
          on GitHub
        </a>{" "}
        under {site.license}.
      </p>

      <h2>Next</h2>
      <ul>
        <li>
          Every default shortcut, all rebindable: <Link href="/docs/keybindings">Keybindings</Link>.
        </li>
        <li>
          Common questions: <Link href="/docs/faq">FAQ</Link>.
        </li>
        <li>
          Bugs and ideas:{" "}
          <a href={site.issues} target="_blank" rel="noopener noreferrer">
            open an issue
          </a>
          .
        </li>
      </ul>
    </article>
  );
}
