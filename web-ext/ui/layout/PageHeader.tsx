export default function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div class="tw-mb-8">
      <h1 class="tw-text-2xl tw-font-medium tw-text-fg">{title}</h1>
      {description && <p class="tw-text-fg-muted tw-mt-1 tw-text-sm tw-max-w-2xl">{description}</p>}
    </div>
  );
}
