// NumberField.tsx

import { forwardRef, Ref, useCallback, useMemo } from "react";
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

// building regex pattern
const getPattern = (allowDecimals: boolean, allowNegative: boolean) => {
  let pattern = "[^0-9";
  if (allowDecimals) pattern += ".";
  if (allowNegative) pattern += "-";
  pattern += "]";
  return new RegExp(pattern, "g");
};

const allowedKeys = new Set([
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
]);

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

  // In component
  const numericPattern = useMemo(
    () => getPattern(allowDecimals, allowNegative),
    [allowDecimals, allowNegative]
  );

  // Number cleaning utility
  const cleanNumericValue = useCallback(
    (value: string): string => {
      // Early return for empty string
      if (!value) return value;

      // Single pass cleaning
      let cleaned = value.replace(numericPattern, "");

      // Combine negative handling
      if (allowNegative && cleaned.includes("-")) {
        const negativeIndex = cleaned.indexOf("-");
        if (negativeIndex > 0) {
          // Move negative to front in one operation
          cleaned = "-" + cleaned.replace(/-/g, "");
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

      // Only parse when needed for min/max validation
      if (min !== undefined || max !== undefined) {
        const numValue = parseFloat(cleaned);
        if (!isNaN(numValue)) {
          if (min !== undefined && numValue < min) {
            cleaned = min.toString();
          }
          if (max !== undefined && numValue > max) {
            cleaned = max.toString();
          }
        }
      }

      return cleaned;
    },
    [numericPattern, allowDecimals, allowNegative, maxDecimals, min, max]
  );

  // Prevent non-numeric key presses
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        !allowedKeys.has(e.key) &&
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

  // Validate number field specific props
  if (maxDecimals < 0) {
    console.warn("NumberField: maxDecimals should be >= 0");
    return null;
  }

  if (min !== undefined && max !== undefined && min > max) {
    console.error("NumberField: min value cannot be greater than max value");
    return null;
  }

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

// future improvements
/* 
// Password strength indicator
showStrength?: boolean;

// Password requirements
requirements?: {
  minLength?: number;
  requireUppercase?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
}

// Caps lock warning
showCapsLockWarning?: boolean;

// Copy/paste control
allowPaste?: boolean;
*/
