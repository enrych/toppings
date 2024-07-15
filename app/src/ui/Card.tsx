import React, { ReactNode } from "react";

function Card({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode | ReactNode[];
}) {
  return (
    <section className="bg-[#18181b] mb-6 p-4 rounded-lg shadow-lg">
      {(title || description) && (
        <div className="pt-4 pl-4">
          <h3 className="text-4xl text-white font-bold">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      )}
      <div className="flex flex-col items-start justify-around py-8 gap-4">
        {children}
      </div>
    </section>
  );
}

export default Card;
