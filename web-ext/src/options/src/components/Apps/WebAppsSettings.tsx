import React from "react";
import GeneralSettings from "./GeneralSettings";
import Routes from "./Routes";
import Card from "../../../../components/Card";
import { WebApps } from "../../../../extension.config";

const WebAppsSettings = ({ name }: { name: WebApps }) => {
  const title = name.at(0)?.toUpperCase() + name.slice(1);
  return (
    <Card title={title}>
      <GeneralSettings name={name} />
      <Routes name={name} />
    </Card>
  );
};

export default WebAppsSettings;
