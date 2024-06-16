import { ReactNode } from "react";

function Category({
  title,
  children,
}: {
  title: string;
  children: ReactNode | ReactNode[];
}) {
  return (
    <section className="mb-6 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-serif mb-3">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

export default Category;
