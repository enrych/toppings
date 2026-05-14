import React from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../shared/components/layout/PageHeader";
import Section from "../../shared/components/layout/Section";
import Card from "../../shared/components/layout/Card";

export default function Playlist() {
  return (
    <>
      <PageHeader
        title="Playlist"
        description="Settings for YouTube playlist pages."
      />

      <div className="tw-flex tw-flex-col tw-gap-8">
        <Section
          title="Runtime Statistics"
          description="When enabled, the total and average runtime for a playlist appears at the top of the page."
        >
          <Card>
            <p className="tw-text-sm tw-text-gray-400 tw-py-3">
              The Playlist feature toggle lives on the{" "}
              <Link to="/" className="tw-text-blue-400 hover:tw-text-blue-300">
                General
              </Link>{" "}
              page. There are no other playlist-specific settings yet.
            </p>
          </Card>
        </Section>
      </div>
    </>
  );
}
