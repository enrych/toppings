import Card from "../../../../../ui/Card";
import GeneralSettings from "./GeneralSettings";

const AppWorker = ({ name }: { name: string }) => {
  const title = name.at(0)?.toUpperCase() + name.slice(1);
  return (
    <Card title={title}>
      <GeneralSettings name={name} />
    </Card>
  );
};

export default AppWorker;
