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
    <section className="tw-bg-[#18181b] tw-mb-6 tw-p-4 tw-rounded-lg tw-shadow-lg">
      {(title || description) && (
        <div className="tw-pt-4 tw-pl-4">
          <h3 className="tw-text-4xl tw-text-white tw-font-bold">{title}</h3>
          <p className="tw-text-gray-400 tw-text-sm">{description}</p>
        </div>
      )}
      <div className="tw-flex tw-flex-col tw-items-start tw-justify-around tw-py-8 tw-gap-4">
        {children}
      </div>
    </section>
  );
}

export default Card;
