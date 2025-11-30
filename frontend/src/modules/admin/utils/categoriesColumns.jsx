import { DEFAULT_PLACEHOLDER_IMAGE } from "@/config/app.constants.js";

export function buildCategoryColumns({
  placeholderImage = DEFAULT_PLACEHOLDER_IMAGE,
} = {}) {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
      size: 80,
      meta: { align: "left" },
      cell: ({ getValue, row }) => {
        const category = row.original;
        const image = category.coverImage || placeholderImage;
        const initial = category.name?.[0]?.toUpperCase() ?? "C";
        return (
          <div className="flex items-center gap-3 px-1 py-2">
            {image ? (
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-(--surface-subtle)">
                <img src={image} alt={category.name ?? "Categoría"} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--surface-subtle)">
                <span className="text-sm font-semibold text-(--text-muted)">{initial}</span>
              </div>
            )}
            <span className="text-sm font-medium text-(--text-strong)">{getValue()}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "slug",
      header: "Slug",
      size: 40,
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="px-1 py-2 text-sm font-regular w-fit text-muted">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Descripción",
      size: 360,
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="px-1 py-2 text-sm text-(--text-secondary1) wrap-break-word">{getValue() || "—"}</span>
      ),
    },
  ];
}
