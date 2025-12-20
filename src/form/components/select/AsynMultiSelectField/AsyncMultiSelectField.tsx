// components/AsyncMultiSelectField.tsx

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@src/components/ui/form";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@src/components/ui/multi-select";
import { cn } from "@src/lib/utils";
import { Loader2 } from "lucide-react";
import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import toId from "@src/form/utils/toId";
import useDebounce from "@src/form/utils/useDebounce";
import { AsyncSelectFetchFunction } from "./async-select.types";
import { useInfiniteOptions } from "./useInfiniteOptions";

interface FieldConfigProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;

  /** Function to fetch options from backend */
  fetchOptions: AsyncSelectFetchFunction;

  /** Unique query key for TanStack Query caching */
  queryKey: string[];

  /** Number of items to fetch per page */
  pageSize?: number;

  label?: string;
  placeholder?: string;
  description?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;

  /** Enable/disable search functionality */
  searchEnabled?: boolean;

  /** Debounce delay for search in milliseconds */
  searchDebounce?: number;

  /** Custom search placeholder */
  searchPlaceholder?: string;

  /** Custom empty message */
  emptyMessage?: string;

  /** Overflow behavior for selected items */
  overflowBehavior?: "wrap-when-open" | "wrap" | "cutoff";

  /** Allow clicking badge to remove */
  clickToRemove?: boolean;

  className?: {
    itemClass?: string;
    triggerClass?: string;
    labelClass?: string;
    helperClass?: string;
    descriptionClass?: string;
    controlClass?: string;
    messageClass?: string;
  };
}

export type AsyncMultiSelectFieldProps<T extends FieldValues = FieldValues> =
  FieldConfigProps<T> & {
    value?: string[];
    onValuesChange?: (values: string[]) => void;
    tabIndex?: number;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    style?: React.CSSProperties;
    [key: `data-${string}`]: string | number | boolean | undefined;
  };

function AsyncMultiSelectField<T extends FieldValues = FieldValues>(
  props: AsyncMultiSelectFieldProps<T>
): JSX.Element | null {
  const { control } = useFormContext<T>();

  const {
    name,
    fetchOptions,
    queryKey,
    pageSize = 10,
    label,
    className,
    placeholder,
    description,
    helperText,
    required = false,
    disabled = false,
    searchEnabled = true,
    searchDebounce = 300,
    searchPlaceholder = "Search...",
    emptyMessage = "No options found",
    overflowBehavior = "wrap-when-open",
    clickToRemove = true,
    value,
    onValuesChange,
    ...restProps
  } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, searchDebounce);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch options with infinite loading
  const {
    options,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteOptions({
    queryKey,
    fetchFn: fetchOptions,
    pageSize,
    search: debouncedSearch,
    enabled: !disabled,
  });

  // ✅ Listen to search input changes via MutationObserver
  useEffect(() => {
    const searchInput = document.querySelector(
      "[cmdk-input]"
    ) as HTMLInputElement;

    if (!searchInput || !searchEnabled) return;

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      setSearchQuery(target.value);
    };

    searchInput.addEventListener("input", handleInput);

    return () => {
      searchInput.removeEventListener("input", handleInput);
    };
  }, [searchEnabled]);

  // Infinite scroll handler
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrollPercentage =
        (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;

      // Fetch next page when scrolled 80%
      if (
        scrollPercentage > 80 &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isLoading
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]
  );

  // Validation
  if (!name || !control) {
    if (process.env.NODE_ENV === "development") {
      console.error("AsyncMultiSelectField: 'name' and 'control' are required");
    }
    return null;
  }

  if (!fetchOptions) {
    if (process.env.NODE_ENV === "development") {
      console.error("AsyncMultiSelectField: 'fetchOptions' is required");
    }
    return null;
  }

  const {
    itemClass,
    labelClass,
    triggerClass,
    helperClass,
    descriptionClass,
    controlClass,
    messageClass,
  } = className ?? {};

  const safeId = toId(name);
  const errorId = `${safeId}-error`;
  const descriptionId = description ? `${safeId}-description` : undefined;
  const helperTextId = helperText ? `${safeId}-helper` : undefined;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const ariaDescribedBy = [
          helperTextId,
          descriptionId,
          fieldState.error ? errorId : undefined,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <FormItem className={cn("space-y-1", itemClass)}>
            <FormLabel
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                !label && "sr-only",
                labelClass
              )}
              htmlFor={safeId}
            >
              <span>{label || name}</span>
              {required && <span className="text-destructive">*</span>}
            </FormLabel>

            {helperText && (
              <p
                id={helperTextId}
                className={cn("text-xs text-muted-foreground", helperClass)}
              >
                {helperText}
              </p>
            )}

            <MultiSelect
              values={value !== undefined ? value : field.value || []}
              onValuesChange={(newValues: string[]) => {
                field.onChange(newValues);
                onValuesChange?.(newValues);
              }}
            >
              <FormControl className={cn("", controlClass)}>
                <MultiSelectTrigger
                  id={safeId}
                  className={cn("w-full", triggerClass)}
                  disabled={disabled || isLoading}
                  aria-label={props["aria-label"] || label}
                  aria-describedby={ariaDescribedBy || undefined}
                  aria-invalid={fieldState.error ? "true" : "false"}
                  aria-required={required}
                  onBlur={field.onBlur}
                  {...restProps}
                >
                  <MultiSelectValue
                    placeholder={
                      isLoading
                        ? "Loading options..."
                        : placeholder || `Select ${label || name}`
                    }
                    overflowBehavior={overflowBehavior}
                    clickToRemove={clickToRemove}
                  />
                </MultiSelectTrigger>
              </FormControl>

              <MultiSelectContent
                search={
                  searchEnabled
                    ? {
                        placeholder: searchPlaceholder,
                        emptyMessage: error
                          ? "Error loading options"
                          : emptyMessage,
                      }
                    : false
                }
                // onSearchChange={searchEnabled ? setSearchQuery : undefined}
              >
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="max-h-[300px] overflow-y-auto"
                >
                  <MultiSelectGroup>
                    {/* Loading State */}
                    {isLoading && options.length === 0 && (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading options...
                        </span>
                      </div>
                    )}

                    {/* Error State */}
                    {error && (
                      <div className="p-4 text-center text-sm text-destructive">
                        Error loading options. Please try again.
                      </div>
                    )}

                    {/* Options */}
                    {!isLoading && !error && options.length === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {emptyMessage}
                      </div>
                    )}

                    {options.map((option) => (
                      <MultiSelectItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        badgeLabel={option.badgeLabel}
                      >
                        {option.label}
                      </MultiSelectItem>
                    ))}

                    {/* Loading More Indicator */}
                    {isFetchingNextPage && (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="ml-2 text-xs text-muted-foreground">
                          Loading more...
                        </span>
                      </div>
                    )}
                  </MultiSelectGroup>
                </div>
              </MultiSelectContent>
            </MultiSelect>

            {description && (
              <FormDescription
                id={descriptionId}
                className={cn(
                  "text-sm text-muted-foreground",
                  descriptionClass
                )}
              >
                {description}
              </FormDescription>
            )}

            <FormMessage className={cn("text-sm", messageClass)} id={errorId} />
          </FormItem>
        );
      }}
    />
  );
}

AsyncMultiSelectField.displayName = "AsyncMultiSelectField";

export default AsyncMultiSelectField;
