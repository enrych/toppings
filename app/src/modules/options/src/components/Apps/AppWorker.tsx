import { WorkerName } from "../../../../../store";
import Card from "../../../../../ui/Card";
import GeneralSettings from "./GeneralSettings";
import Routes from "./Routes";

const AppWorker = ({ name }: { name: WorkerName }) => {
  const title = name.at(0)?.toUpperCase() + name.slice(1);
  return (
    <Card title={title}>
      <GeneralSettings name={name} />
      <Routes name={name} />
    </Card>
  );
};

export default AppWorker;
