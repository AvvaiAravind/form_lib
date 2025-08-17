import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@src/components/ui/form";
import { Input } from "@src/components/ui/input";
import { cn } from "@src/lib/utils";
import { forwardRef, InputHTMLAttributes, Ref } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { toId } from "storybook/internal/csf";
import { mergeRefs } from "./utils/mergeRef";

type Types =
  | "text"
  | "email"
  | "number"
  | "password"
  | "tel"
  | "url"
  | "search"
  | "color"
  | "date"
  | "time"
  | "datetime-local"
  | "month"
  | "week";

// type definitions
interface FieldConfigProps<T extends FieldValues = FieldValues> {
  type: Types;
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: {
    itemClass?: string;
    inputClass?: string;
    labelClass?: string;
    descriptionClass?: string;
    controlClass?: string;
    messageClass?: string;
  };
}

// NOTE: If user passes `value`, `onChange`, or `onBlur` via props,
// it will override React Hook Form's defaults.
// This allows controlled usage but removes RHF sync.

type InputFieldConfigProps<T extends FieldValues = FieldValues> =
  FieldConfigProps<T> &
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      "ref" | "className" | "name" | "id" | "type" | "defaultValue"
    > & {
      /** Override RHF's controlled value */
      value?: string | number;

      /** Called in addition to RHF's onChange */
      onChange?: React.ChangeEventHandler<HTMLInputElement>;

      /** Called in addition to RHF's onBlur */
      onBlur?: React.FocusEventHandler<HTMLInputElement>;
    };

const InputField = <T extends FieldValues = FieldValues>(
  props: InputFieldConfigProps<T>,
  ref: Ref<HTMLInputElement>
) => {
  const {
    type = "text",
    control,
    name,
    label,
    className,
    placeholder,
    description,
    required = false,
    disabled = false,
    ...restProps
  } = props;

  // Validation for required props
  if (!name || !control) {
    console.error("InputField: name and control are required props");
    return null;
  }

  if ("defaultValue" in props) {
    console.warn(
      "[InputField]: `defaultValue` is ignored. Please use useForm({ defaultValues }) instead."
    );
  }

  const {
    itemClass,
    labelClass,
    inputClass,
    descriptionClass,
    controlClass,
    messageClass,
  } = className ?? {};

  const safeId = toId(name);
  const errorId = `${safeId}-error`;
  const descriptionId = description ? `${name}-description` : undefined;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const { ref: fieldRef, ...fieldProps } = field;
        const ariaDescribedBy = [
          descriptionId,
          fieldState.error ? errorId : undefined,
        ]
          .filter(Boolean)
          .join(" ");

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
            <FormControl className={cn("", controlClass)}>
              <Input
                ref={mergeRefs(fieldRef, ref)}
                id={safeId}
                className={cn("", inputClass)}
                placeholder={placeholder}
                type={type}
                disabled={disabled}
                required={required}
                aria-describedby={ariaDescribedBy}
                aria-invalid={fieldState.error ? "true" : "false"}
                aria-required={required}
                {...fieldProps}
                value={restProps.value ?? fieldProps.value}
                onChange={(e) => {
                  fieldProps.onChange(e);
                  restProps?.onChange?.(e);
                }}
                onBlur={(e) => {
                  fieldProps.onBlur();
                  restProps?.onBlur?.(e);
                }}
                {...restProps}
              />
            </FormControl>
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
const InputFieldComponent = forwardRef(InputField) as <
  T extends FieldValues = FieldValues,
>(
  props: InputFieldConfigProps<T> & { ref?: Ref<HTMLInputElement> }
) => ReturnType<typeof InputField>;

export default InputFieldComponent;
