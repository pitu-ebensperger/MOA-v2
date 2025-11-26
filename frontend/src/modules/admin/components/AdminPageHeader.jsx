import PropTypes from "prop-types";
import { cn } from "@/utils/cn.js";

export function AdminPageHeader({
  title,
  subtitle,
  icon,
  actions,
  className,
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-2",
        "sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="grid h-10 w-10 place-content-center rounded-2xl bg-(--surface-subtle) text-primary1">
              {icon}
            </span>
          )}
          <div>
            <h1 className="text-3xl font-semibold text-(--text-strong)">{title}</h1>
            {subtitle && (
              <p className="text-sm text-(--text-secondary1)">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}

AdminPageHeader.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  actions: PropTypes.node,
  className: PropTypes.string,
};

export default AdminPageHeader;
