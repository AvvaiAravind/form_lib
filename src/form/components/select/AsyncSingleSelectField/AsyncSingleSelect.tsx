// components/AsyncSingleSelectField.tsx

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@src/components/ui/select";
import toId from "@src/form/utils/toId";
import useDebounce from "@src/form/utils/useDebounce";
import { cn } from "@src/lib/utils";
import { Loader2 } from "lucide-react";
import { JSX, useState } from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { AsyncSelectFetchFunction } from "../AsynMultiSelectField/async-select.types";
import { useInfiniteOptions } from "../AsynMultiSelectField/useInfiniteOptions";

interface FieldConfigProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  fetchOptions: AsyncSelectFetchFunction;
  queryKey: string[];
  pageSize?: number;
  label?: string;
  placeholder?: string;
  description?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  searchEnabled?: boolean;
  searchDebounce?: number;
  searchPlaceholder?: string;
  emptyMessage?: string;
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

export type AsyncSingleSelectFieldProps<T extends FieldValues = FieldValues> =
  FieldConfigProps<T> & {
    value?: string;
    onValueChange?: (value: string) => void;
    tabIndex?: number;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    style?: React.CSSProperties;
    [key: `data-${string}`]: string | number | boolean | undefined;
  };

function AsyncSingleSelectField<T extends FieldValues = FieldValues>(
  props: AsyncSingleSelectFieldProps<T>
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
    value,
    onValueChange,
    ...restProps
  } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, searchDebounce);

  const { options, isLoading, error } = useInfiniteOptions({
    queryKey,
    fetchFn: fetchOptions,
    pageSize,
    search: debouncedSearch,
    enabled: !disabled,
  });

  // Validation
  if (!name || !control) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "AsyncSingleSelectField: 'name' and 'control' are required"
      );
    }
    return null;
  }

  if (!fetchOptions) {
    if (process.env.NODE_ENV === "development") {
      console.error("AsyncSingleSelectField: 'fetchOptions' is required");
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

        // Combine RHF field value/control and custom handlers
        const selectValue = value !== undefined ? value : field.value || "";

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

            <Select
              value={selectValue}
              disabled={disabled || isLoading}
              onValueChange={(newVal) => {
                field.onChange(newVal);
                onValueChange?.(newVal);
              }}
            >
              <FormControl className={cn("", controlClass)}>
                <SelectTrigger
                  id={safeId}
                  className={cn("w-full", triggerClass)}
                  aria-label={props["aria-label"] || label}
                  aria-describedby={ariaDescribedBy || undefined}
                  aria-invalid={fieldState.error ? "true" : "false"}
                  aria-required={required}
                  onBlur={field.onBlur}
                  {...restProps}
                >
                  <SelectValue
                    placeholder={
                      isLoading
                        ? "Loading options..."
                        : placeholder || `Select ${label || name}`
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  {searchEnabled && (
                    <div className="p-2">
                      <input
                        type="text"
                        className="w-full rounded border px-2 py-1 text-sm"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  )}

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
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

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

AsyncSingleSelectField.displayName = "AsyncSingleSelectField";

export default AsyncSingleSelectField;
