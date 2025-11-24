import React from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/Button.jsx";
import { TooltipNeutral } from "@/components/ui/Tooltip.jsx";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/radix/DropdownMenu.jsx";
import { cn } from "@/utils/classNames.js";

export function ResponsiveRowActions({
  actions = [],
  menuLabel = "Mostrar acciones",
  tooltipPosition = "bottom",
  menuContentClassName = "w-44",
}) {
  if (!actions.length) {
    return null;
  }

  return (
    <div className="flex w-full items-center justify-end gap-2">
      <div className="hidden md:flex w-full items-center justify-end gap-2">
        {actions.map((action) => {
          const handleAction = action.onAction ?? (() => {});
          return (
            <TooltipNeutral
              key={action.key}
              label={action.label}
              position={tooltipPosition}
            >
              <Button
                type="button"
                appearance="ghost"
                intent={action.intent ?? "neutral"}
                size="sm"
                className="h-8 w-8 p-0"
                aria-label={action.label}
                title={action.label}
                onClick={handleAction}
                disabled={action.disabled}
              >
                {action.icon ? (
                  <action.icon className={action.iconClassName ?? "h-4 w-4"} />
                ) : null}
              </Button>
            </TooltipNeutral>
          );
        })}
      </div>
      <div className="flex w-full justify-end md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              appearance="ghost"
              intent="neutral"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label={menuLabel}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn(menuContentClassName)}
          >
            {actions.map((action) => {
              const handleAction = action.onAction ?? (() => {});
              return (
                <React.Fragment key={`row-action-${action.key}`}>
                  {action.separatorBefore && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onSelect={() => {
                      if (!action.disabled) {
                        handleAction();
                      }
                    }}
                    className={cn(
                      action.menuItemClassName,
                      action.danger ? "text-(--color-error)" : "text-(--color-secondary2)",
                    )}
                  >
                    {action.icon ? (
                      <action.icon className="mr-2 h-4 w-4 text-(--color-text-muted)" />
                    ) : null}
                    {action.label}
                  </DropdownMenuItem>
                </React.Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
