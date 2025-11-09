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
import { /* forwardRef, Ref,  */ useMemo } from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { toId } from "storybook/internal/csf";
// import { mergeRefs } from "../utils/mergeRef";

// Enhanced option types
interface SimpleOption {
  _id?: string;
  id?: string;
  label: string;
  value: string;
  disabled?: boolean;
  badgeLabel?: string; // For custom badges like 🍎
}

interface OptionGroup {
  label: string;
  options: SimpleOption[];
}

interface SeparatorOption {
  type: "separator";
}

type OptionItem = SimpleOption | OptionGroup | SeparatorOption;

// Type definitions
interface FieldConfigProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  options: OptionItem[];
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

    // HTML attributes
    tabIndex?: number;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    style?: React.CSSProperties;

    // Allow any data-* attributes
    [key: `data-${string}`]: string | number | boolean | undefined;
  };

// Type guards
const isSimpleOption = (item: OptionItem): item is SimpleOption => {
  return "value" in item && "label" in item;
};

const isOptionGroup = (item: OptionItem): item is OptionGroup => {
  return "options" in item && Array.isArray(item.options);
};

const isSeparator = (item: OptionItem): item is SeparatorOption => {
  return "type" in item && item.type === "separator";
};

// Note: MultiSelect doesn't need ref forwarding (uses internal state)
// So we create it as a regular function component
function MultiSelectFieldComp<T extends FieldValues = FieldValues>(
  props: MultiSelectFieldConfigProps<T>
) {
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
    // disabled = false,
    isLoading = false,
    loadingText = "Loading options...",
    emptyText = "No options available",
    search = true,
    overflowBehavior = "wrap-when-open",
    clickToRemove = true,
    value,
    onValuesChange,
    // onOpenChange,
    ...restProps
  } = props;

  // Memoized options rendering with loading and empty states
  const renderedOptions = useMemo(() => {
    // Loading state
    if (isLoading) {
      return (
        <MultiSelectItem value="" disabled>
          {loadingText}
        </MultiSelectItem>
      );
    }

    // Empty state
    if (!options || options.length === 0) {
      return (
        <MultiSelectItem value="" disabled>
          {emptyText}
        </MultiSelectItem>
      );
    }

    // Render options
    return options.map((item, index) => {
      if (isSimpleOption(item)) {
        return (
          <MultiSelectItem
            key={item._id || item.id || `${item.value}-${index}`}
            value={item.value}
            disabled={item.disabled}
            badgeLabel={item.badgeLabel}
          >
            {item.label}
          </MultiSelectItem>
        );
      } else if (isOptionGroup(item)) {
        return (
          <MultiSelectGroup key={`group-${item.label}-${index}`}>
            {item.options.map((option, optIndex) => (
              <MultiSelectItem
                key={option._id || option.id || `${option.value}-${optIndex}`}
                value={option.value}
                disabled={option.disabled}
                badgeLabel={option.badgeLabel}
              >
                {option.label}
              </MultiSelectItem>
            ))}
          </MultiSelectGroup>
        );
      } else if (isSeparator(item)) {
        // MultiSelect doesn't have separator, skip it
        return null;
      }
      return null;
    });
  }, [options, isLoading, loadingText, emptyText]);

  // Validation for required props
  if (!name || !control) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "MultiSelectField: 'name' and 'control' are required props"
      );
    }
    return null;
  }

  // Warn about defaultValue usage
  if ("defaultValue" in props) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[MultiSelectField "${name}"]: 'defaultValue' is ignored. Use useForm({ defaultValues }) instead.`
      );
    }
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
              //   disabled={disabled || isLoading}
              onValuesChange={(newValues: string[]) => {
                field.onChange(newValues);
                onValuesChange?.(newValues);
              }}
              values={value !== undefined ? value : field.value || []}
              //   onOpenChange={onOpenChange}
              {...restProps}
            >
              <FormControl className={cn("", controlClass)}>
                <MultiSelectTrigger
                  id={safeId}
                  className={cn("w-full", triggerClass)}
                  aria-label={props["aria-label"] || label}
                  aria-describedby={ariaDescribedBy || undefined}
                  aria-invalid={fieldState.error ? "true" : "false"}
                  aria-required={required}
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
}

// No forwardRef needed for MultiSelect (it manages its own state internally)
// const MultiSelectField = MultiSelectFieldComp as <
//   T extends FieldValues = FieldValues,
// >(
//   props: MultiSelectFieldConfigProps<T>
// ) => JSX.Element | null;

export default MultiSelectFieldComp;
