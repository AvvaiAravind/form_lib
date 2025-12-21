import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@src/components/ui/form";
import { cn } from "@src/lib/utils";
import { forwardRef, ReactNode, Ref, useState } from "react";
import { FieldValues, useFormContext } from "react-hook-form";
import { mergeRefs } from "../utils/mergeRef";
import toId from "../utils/toId";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@src/components/ui/input-group";
import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes } from "react";
import { FieldPath } from "react-hook-form";

type BtnNeedType = {
  isBtnNeed?: true;
  showIcon?: ReactNode;
  hideIcon?: ReactNode;
};

type BtnNotNeedType = {
  isBtnNeed: false;
};

type GroupBtnConfig = BtnNeedType | BtnNotNeedType;

// type definitions
interface FieldConfigProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: "current-password" | "new-password";
  groupBtn?: GroupBtnConfig;
  className?: {
    itemClass?: string;
    inputClass?: string;
    labelClass?: string;
    descriptionClass?: string;
    controlClass?: string;
    messageClass?: string;
    inputGroupClass?: string;
    inputGroupAddonClass?: string;
    inputGroupBtnClass?: string;
  };
}

// NOTE: If user passes `value`, `onChange`, or `onBlur` via props,
// it will override React Hook Form's defaults.
// This allows controlled usage but removes RHF sync.

export type PasswordFieldConfigProps<T extends FieldValues = FieldValues> =
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

const PasswordFieldComp = <T extends FieldValues = FieldValues>(
  props: PasswordFieldConfigProps<T>,
  ref: Ref<HTMLInputElement>
) => {
  const { control } = useFormContext<T>();

  const {
    name,
    label,
    className,
    placeholder,
    description,
    required = false,
    disabled = false,
    groupBtn,
    ...restProps
  } = props;

  // Clean type narrowing
  const shouldShowButton = groupBtn?.isBtnNeed !== false;
  const showIcon =
    shouldShowButton && groupBtn && "showIcon" in groupBtn ? (
      (groupBtn.showIcon ?? <Eye />)
    ) : (
      <Eye />
    );
  const hideIcon =
    shouldShowButton && groupBtn && "hideIcon" in groupBtn ? (
      (groupBtn.hideIcon ?? <EyeOff />)
    ) : (
      <EyeOff />
    );

  const [type, setType] = useState<"text" | "password">("password");

  if (!name || !control) {
    console.error("PasswordField: must be used inside FormProvider");
    return null;
  }

  if ("defaultValue" in props) {
    console.warn(
      "[PasswordField]: `defaultValue` is ignored. Please use useForm({ defaultValues }) instead."
    );
  }

  const {
    itemClass,
    labelClass,
    inputClass,
    descriptionClass,
    controlClass,
    messageClass,
    inputGroupClass,
    inputGroupAddonClass,
    inputGroupBtnClass,
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
            <FormControl className={cn("", controlClass)}>
              <InputGroup className={cn("", inputGroupClass)}>
                <InputGroupInput
                  type={type}
                  ref={mergedRef}
                  id={safeId}
                  className={cn("", inputClass)}
                  placeholder={placeholder || name}
                  disabled={disabled}
                  required={required}
                  aria-describedby={ariaDescribedBy}
                  aria-invalid={fieldState.error ? "true" : "false"}
                  aria-required={required}
                  autoComplete={restProps?.autoComplete ?? "current-password"}
                  {...fieldProps}
                  {...restProps}
                  onChange={(e) => {
                    fieldProps.onChange(e);
                    restProps?.onChange?.(e);
                  }}
                  onBlur={(e) => {
                    fieldProps.onBlur();
                    restProps?.onBlur?.(e);
                  }}
                  value={restProps.value ?? fieldProps.value}
                />
                {shouldShowButton && (
                  <InputGroupAddon
                    className={cn("", inputGroupAddonClass)}
                    align="inline-end"
                  >
                    <InputGroupButton
                      className={cn("hover:cursor-pointer", inputGroupBtnClass)}
                      variant="ghost"
                      aria-label="Toggle password visibility"
                      size="icon-xs"
                      onClick={() =>
                        setType((prev) =>
                          prev === "password" ? "text" : "password"
                        )
                      }
                    >
                      {type === "password" ? showIcon : hideIcon}
                    </InputGroupButton>
                  </InputGroupAddon>
                )}
              </InputGroup>
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

const PasswordField = forwardRef(PasswordFieldComp) as <
  T extends FieldValues = FieldValues,
>(
  props: PasswordFieldConfigProps<T> & { ref?: Ref<HTMLInputElement> }
) => ReturnType<typeof PasswordFieldComp>;

export default PasswordField;
