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
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
} from "@src/components/ui/select";
import { cn } from "@src/lib/utils";
import { forwardRef, Ref /* SelectHTMLAttributes */, useMemo } from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { mergeRefs } from "../utils/mergeRef";
import toId from "../utils/toId";

// Enhanced option types
export interface SelectSimpleOption {
  _id?: string;
  id?: string;
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectSimpleOption[];
}

export interface SelectSeparatorOption {
  type: "separator";
}

export type SelectOptionItem =
  | SelectSimpleOption
  | SelectOptionGroup
  | SelectSeparatorOption;

// type definitions
interface FieldConfigProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  options: SelectOptionItem[];
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  showScrollButtons?: boolean;
  /** Helpful hints or requirements - appears between label and input */
  helperText?: string;
  /** Loading state for async options */
  isLoading?: boolean;

  /** Custom loading message */
  loadingText?: string;

  /** Message when no options available */
  emptyText?: string;
  className?: {
    itemClass?: string;
    selectClass?: string;
    labelClass?: string;
    descriptionClass?: string;
    controlClass?: string;
    messageClass?: string;
    helperClass?: string;
  };
}

// NOTE: If user passes `value`, `onChange`, or `onBlur` via props,
// it will override React Hook Form's defaults.
// This allows controlled usage but removes RHF sync.

export type SelectFieldConfigProps<T extends FieldValues = FieldValues> =
  FieldConfigProps<T> & /*     Omit<
      SelectHTMLAttributes<HTMLSelectElement>,
      | "ref"
      | "className"
      | "name"
      | "id"
      | "type"
      | "defaultValue"
      | "onChange"
      | "onBlur"
    > & */ {
    /** Override RHF's controlled value */
    value?: string;

    /** Called in addition to RHF's onChange */
    onValueChange?: (value: string) => void;

    /** Called in addition to RHF's onBlur */
    onOpenChange?: (open: boolean) => void;

    // Only include the specific HTML attributes you actually need
    form?: string;
    autoComplete?: string;
    tabIndex?: number;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "data-testid"?: string;
    style?: React.CSSProperties;

    // Allow any data-* attributes
    [key: `data-${string}`]: string | number | boolean | undefined;
  };

// type guards

const SelectFieldComp = <T extends FieldValues = FieldValues>(
  props: SelectFieldConfigProps<T>,
  ref: Ref<HTMLSelectElement>
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
    showScrollButtons = false,
    isLoading = false,
    loadingText = "Loading options...",
    emptyText = "No options available",
    value,
    onValueChange,
    onOpenChange,
    form,
    autoComplete,
    ...restProps
  } = props;

  const renderOptions = useMemo(
    () => renderSelectOptions(options, isLoading, loadingText, emptyText),
    [options, isLoading, loadingText, emptyText]
  );

  // Validation for required props
  if (!name || !control) {
    console.error("SelectField: name and control are required props");
    return null;
  }

  if ("defaultValue" in props) {
    console.warn(
      "[SelectField]: `defaultValue` is ignored. Please use useForm({ defaultValues }) instead."
    );
  }

  const {
    itemClass,
    labelClass,
    selectClass,
    descriptionClass,
    controlClass,
    messageClass,
    helperClass,
  } = className ?? {};

  const safeId = toId(name);
  const errorId = `${safeId}-error`;
  const descriptionId = description ? `${name}-description` : undefined;
  const helperTextId = helperText ? `${safeId}-helper` : undefined;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const { ref: fieldRef, ...fieldProps } = field;
        const ariaDescribedBy = [
          descriptionId,
          helperTextId,
          fieldState.error ? errorId : undefined,
        ]
          .filter(Boolean)
          .join(" ");
        const mergedRef = mergeRefs(fieldRef, ref);

        return (
          <FormItem className={cn("space-y-0", itemClass)}>
            <FormLabel
              className={cn(
                "flex items-center justify-start text-sm font-medium",
                label ? "" : "hidden",
                labelClass
              )}
              htmlFor={safeId}
            >
              <span>{label ? label : name}</span>
              {required && <span className="text-red-500">*</span>}
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
            <Select
              disabled={disabled}
              required={required}
              form={form}
              autoComplete={autoComplete}
              {...fieldProps}
              onValueChange={(value: string) => {
                fieldProps.onChange(value);
                onValueChange?.(value);
              }}
              onOpenChange={(open: boolean) => {
                if (!open) {
                  fieldProps.onBlur();
                }
                onOpenChange?.(open);
              }}
              value={
                value
                  ? String(value)
                  : fieldProps.value
                    ? String(fieldProps.value)
                    : undefined
              }
              // defaultValue={field.value}
            >
              <FormControl className={cn("", controlClass)}>
                <SelectTrigger
                  ref={mergedRef}
                  id={safeId}
                  className={cn("w-full", selectClass)}
                  aria-label={props["aria-label"] || label}
                  aria-describedby={ariaDescribedBy}
                  aria-invalid={fieldState.error ? "true" : "false"}
                  aria-required={required}
                  {...restProps}
                >
                  <SelectValue placeholder={placeholder || name} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {showScrollButtons && <SelectScrollUpButton />}
                {renderOptions}
                {showScrollButtons && <SelectScrollDownButton />}
              </SelectContent>
            </Select>
            {description && (
              <FormDescription
                id={descriptionId}
                className={cn("text-sm text-gray-600", descriptionClass)}
              >
                {description}
              </FormDescription>
            )}
            <FormMessage className={cn("", messageClass)} id={errorId} />
          </FormItem>
        );
      }}
    />
  );
};

// Create the forwardRef component with proper typing
const SelectField = forwardRef(SelectFieldComp) as <
  T extends FieldValues = FieldValues,
>(
  props: SelectFieldConfigProps<T> & { ref?: Ref<HTMLSelectElement> }
) => ReturnType<typeof SelectFieldComp>;

export default SelectField;
