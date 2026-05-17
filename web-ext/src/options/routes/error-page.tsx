import React from "react";
import { useRouteError } from "react-router-dom";
import Button from "../../shared/components/primitives/Button";
import Icon from "../../shared/components/primitives/Icon";

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
      className="tw-bg-bg tw-text-fg tw-flex tw-flex-col tw-items-center tw-justify-center tw-min-h-screen tw-p-8"
    >
      <div className="tw-bg-surface tw-border tw-border-border-default tw-rounded-xl tw-p-8 tw-text-center tw-max-w-md tw-shadow-xl">
        <div className="tw-w-12 tw-h-12 tw-mx-auto tw-mb-4 tw-rounded-full tw-bg-danger-bg tw-text-danger-fg tw-flex tw-items-center tw-justify-center">
          <Icon name="alert" size={24} />
        </div>
        <h1 className="tw-text-2xl tw-font-bold tw-text-fg tw-mb-2">
          Something went wrong
        </h1>
        <p className="tw-text-sm tw-text-fg-muted tw-mb-1">
          An unexpected error occurred.
        </p>
        <p className="tw-text-xs tw-text-fg-subtle tw-mb-6 tw-font-mono">
          {error?.statusText || error?.message}
        </p>
        <Button
          variant="primary"
          leadingIcon={<Icon name="external" size={14} />}
          onClick={handleFileIssue}
        >
          Report this issue
        </Button>
      </div>
    </div>
  );
}
