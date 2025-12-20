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
  MultiSelectTrigger,
  MultiSelectValue,
} from "@src/components/ui/multi-select";
import { cn } from "@src/lib/utils";
import { useMemo } from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { SelectOptionItem } from "../select.types";
import { renderMultiSelectOptions } from "./MultiSelectHelper";
import toId from "@src/form/utils/toId";
// import { mergeRefs } from "../utils/mergeRef";

// Type definitions
interface FieldConfigProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  options: SelectOptionItem[];
  label?: string;
  placeholder?: string;

  /** Contextual information about the field - appears below input */
  description?: string;

  /** Helpful hints or requirements - appears between label and input */
  helperText?: string;

  required?: boolean;
  disabled?: boolean;

  /** Loading state for async options */
  isLoading?: boolean;

  /** Custom loading message */
  loadingText?: string;

  /** Message when no options available */
  emptyText?: string;

  /** Search configuration */
  search?:
    | boolean
    | {
        placeholder?: string;
        emptyMessage?: string;
      };

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

export type MultiSelectFieldConfigProps<T extends FieldValues = FieldValues> =
  FieldConfigProps<T> & {
    /** Override RHF's controlled value */
    value?: string[];

    /** Called in addition to RHF's onChange */
    onValuesChange?: (values: string[]) => void;

    /** Called when dropdown opens/closes */
    onOpenChange?: (open: boolean) => void;

    tabIndex?: number;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    style?: React.CSSProperties;

    // Allow any data-* attributes
    [key: `data-${string}`]: string | number | boolean | undefined;
  };

// Note: MultiSelect doesn't need ref forwarding (uses internal state)
// So we create it as a regular function component
const MultiSelectField = <T extends FieldValues = FieldValues>(
  props: MultiSelectFieldConfigProps<T>
) => {
  const { control } = useFormContext<T>();

  const {
    name,
    options,
    label,
    className,
    placeholder,
    description,
    helperText,
    required = false,
    disabled = false,
    isLoading = false,
    loadingText = "Loading options...",
    emptyText = "No options available",
    search = true,
    overflowBehavior = "wrap-when-open",
    clickToRemove = true,
    value,
    onValuesChange,
    ...restProps
  } = props;

  // Memoized options rendering with loading and empty states
  const renderedOptions = useMemo(
    () => renderMultiSelectOptions(options, isLoading, loadingText, emptyText),
    [options, isLoading, loadingText, emptyText]
  );

  // Validation for required props
  if (!name || !control) {
    console.error("MultiSelectField: 'name' and 'control' are required props");

    return null;
  }

  // Warn about defaultValue usage
  if ("defaultValue" in props) {
    console.warn(
      `[MultiSelectField "${name}"]: 'defaultValue' is ignored. Use useForm({ defaultValues }) instead.`
    );
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
        // Build aria-describedby with all descriptive elements
        const ariaDescribedBy = [
          helperTextId,
          descriptionId,
          fieldState.error ? errorId : undefined,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <FormItem className={cn("space-y-1", itemClass)}>
            {/* Label */}
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

            {/* Helper Text - appears between label and input */}
            {helperText && (
              <p
                id={helperTextId}
                className={cn("text-xs text-muted-foreground", helperClass)}
              >
                {helperText}
              </p>
            )}

            {/* MultiSelect Component */}
            <MultiSelect
              onValuesChange={(newValues: string[]) => {
                field.onChange(newValues);
                onValuesChange?.(newValues);
              }}
              values={value !== undefined ? value : field.value || []}
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
                  {...restProps}
                >
                  <MultiSelectValue
                    placeholder={placeholder || `Select ${label || name}`}
                    overflowBehavior={overflowBehavior}
                    clickToRemove={clickToRemove}
                  />
                </MultiSelectTrigger>
              </FormControl>

              <MultiSelectContent search={search}>
                <MultiSelectGroup>{renderedOptions}</MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>

            {/* Description - appears below input */}
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

            {/* Error Message - appears at bottom */}
            <FormMessage className={cn("text-sm", messageClass)} id={errorId} />
          </FormItem>
        );
      }}
    />
  );
};

// // No forwardRef needed for MultiSelect (it manages its own state internally)
// const MultiSelectField = forwardRef(MultiSelectFieldComp) as <
//   T extends FieldValues = FieldValues,
// >(
//   props: MultiSelectFieldConfigProps<T> & { ref?: Ref<HTMLSelectElement> }
// ) => ReturnType<typeof MultiSelectFieldComp>;

export default MultiSelectField;
