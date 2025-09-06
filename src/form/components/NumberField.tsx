// NumberField.tsx

import { forwardRef, Ref, useCallback } from "react";
import { FieldValues } from "react-hook-form";
import InputFieldComponent, { InputFieldConfigProps } from "./InputField";

interface NumberFieldConfig {
  allowDecimals?: boolean;
  allowNegative?: boolean;
  maxDecimals?: number;
  min?: number;
  max?: number;
}

type NumberFieldProps<T extends FieldValues = FieldValues> = Omit<
  InputFieldConfigProps<T>,
  "type"
> &
  NumberFieldConfig;

const NumberFieldComp = <T extends FieldValues = FieldValues>(
  props: NumberFieldProps<T>,
  ref: Ref<HTMLInputElement>
) => {
  const {
    allowDecimals = false,
    allowNegative = false,
    maxDecimals = 2,
    min,
    max,
    onChange,
    onKeyDown,
    ...inputFieldProps
  } = props;

  // Number cleaning utility
  const cleanNumericValue = useCallback(
    (value: string): string => {
      let cleaned = value;

      // Remove all non-numeric characters except decimal and negative
      let pattern = "[^0-9";
      if (allowDecimals) pattern += ".";
      if (allowNegative) pattern += "-";
      pattern += "]";

      cleaned = cleaned.replace(new RegExp(pattern, "g"), "");

      // Handle negative sign - only at the beginning
      if (allowNegative) {
        const negativeCount = (cleaned.match(/-/g) || []).length;
        if (negativeCount > 1) {
          cleaned = cleaned.replace(/-/g, "");
          if (negativeCount > 0) cleaned = "-" + cleaned;
        }
        // Ensure negative is at the start
        if (cleaned.includes("-") && !cleaned.startsWith("-")) {
          cleaned = cleaned.replace("-", "");
          cleaned = "-" + cleaned;
        }
      }

      // Handle decimal places
      if (allowDecimals) {
        const decimalCount = (cleaned.match(/\./g) || []).length;
        if (decimalCount > 1) {
          // Keep only the first decimal
          const firstDecimalIndex = cleaned.indexOf(".");
          const beforeDecimal = cleaned.substring(0, firstDecimalIndex + 1);
          const afterDecimal = cleaned
            .substring(firstDecimalIndex + 1)
            .replace(/\./g, "");
          cleaned = beforeDecimal + afterDecimal;
        }

        // Limit decimal places
        if (maxDecimals > 0 && cleaned.includes(".")) {
          const [integer, decimal] = cleaned.split(".");
          cleaned = `${integer}.${decimal.substring(0, maxDecimals)}`;
        }
      }

      // Apply min/max constraints
      const numValue = parseFloat(cleaned);
      if (!isNaN(numValue)) {
        if (min !== undefined && numValue < min) {
          cleaned = min.toString();
        }
        if (max !== undefined && numValue > max) {
          cleaned = max.toString();
        }
      }

      return cleaned;
    },
    [allowDecimals, allowNegative, maxDecimals, min, max]
  );

  // Prevent non-numeric key presses
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];

      const isNumeric = /[0-9]/.test(e.key);
      const isDecimal =
        allowDecimals && e.key === "." && !e.currentTarget.value.includes(".");
      const isNegative =
        allowNegative &&
        e.key === "-" &&
        e.currentTarget.selectionStart === 0 &&
        !e.currentTarget.value.includes("-");

      // Allow Ctrl/Cmd combinations (copy, paste, etc.)
      const isCtrlCmd = e.ctrlKey || e.metaKey;

      if (
        !allowedKeys.includes(e.key) &&
        !isNumeric &&
        !isDecimal &&
        !isNegative &&
        !isCtrlCmd
      ) {
        e.preventDefault();
      }

      // Call custom onKeyDown if provided
      onKeyDown?.(e);
    },
    [allowDecimals, allowNegative, onKeyDown]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanedValue = cleanNumericValue(e.target.value);
      const cleanedEvent = {
        ...e,
        target: { ...e.target, value: cleanedValue },
      } as React.ChangeEvent<HTMLInputElement>;

      // Call the custom onChange if provided
      onChange?.(cleanedEvent);
    },
    [cleanNumericValue, onChange]
  );

  return (
    <InputFieldComponent
      ref={ref}
      {...inputFieldProps}
      type="text"
      inputMode="numeric"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
};

// Create the forwardRef component with proper typing
const NumberField = forwardRef(NumberFieldComp) as <
  T extends FieldValues = FieldValues,
>(
  props: NumberFieldProps<T> & { ref?: Ref<HTMLInputElement> }
) => ReturnType<typeof NumberFieldComp>;

export default NumberField;
