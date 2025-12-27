import { cn } from "@src/lib/utils";
import {
  ComponentPropsWithoutRef,
  forwardRef,
  Ref,
  useCallback,
  useState,
} from "react";
import { Slider } from "./ui/slider";

type SingleMode = {
  mode?: "single";
  defaultValue?: [number];
  value?: [number];
  onValueChange?: (value: [number]) => void;
};

type RangeMode = {
  mode: "range";
  defaultValue?: [number, number];
  value?: [number, number];
  onValueChange?: (value: [number, number]) => void;
};

type RangeSliderProps = {
  label: string;
  min?: number;
  max?: number;
  step?: number;

  //customization
  className?: {
    wrapperClass?: string;
    sliderClass?: string;
    titleClass?: string;
    descriptionClass?: string;
    headerClass?: string;
  };
  formatValue?: (value: number) => string;
  showValue?: boolean;
  disabled?: boolean;
} & (SingleMode | RangeMode) &
  Omit<
    ComponentPropsWithoutRef<typeof Slider>,
    | "value"
    | "onValueChange"
    | "defaultValue"
    | "min"
    | "max"
    | "step"
    | "disabled"
    | "className"
  >;

const RangeSliderComp = (
  {
    label,
    className,
    min = 1,
    max = 100,
    step = 1,
    defaultValue,
    value: controlledValue,
    onValueChange,
    formatValue = (value: number) => value.toString(),
    showValue = true,
    disabled = false,
    mode = "single",
    ...props
  }: RangeSliderProps,
  ref: Ref<HTMLSpanElement>
) => {
  const getDefaultValue = useCallback(() => {
    if (mode === "single") {
      return defaultValue ?? [min];
    } else {
      return defaultValue ?? [min, max];
    }
  }, [defaultValue, min, max, mode]);

  // internal value for uncontrolled state
  const [internalValue, setInternalValue] =
    useState<number[]>(getDefaultValue());

  const {
    wrapperClass,
    sliderClass,
    titleClass,
    descriptionClass,
    headerClass,
  } = className ?? {};

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  if (isControlled && defaultValue !== undefined) {
    console.warn(
      "RangeSlider: Component is controlled (has `value` prop) but also has `defaultValue`. " +
        "`defaultValue` will be ignored. Remove it or remove `value` to use uncontrolled mode."
    );
  }

  // event handler
  const handleSliderChange = (newValue: number[]) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }

    // Call appropriate callback based on mode
    if (mode === "range" && onValueChange) {
      (onValueChange as (value: [number, number]) => void)([
        newValue[0],
        newValue[1],
      ]);
    } else if (mode === "single" && onValueChange) {
      (onValueChange as (value: [number]) => void)([newValue[0]]);
    }
  };

  const displayValue =
    mode === "single"
      ? `${formatValue(value[0])}`
      : `${formatValue(value[0])} - ${formatValue(value[1])}`;

  return (
    <div
      className={cn(
        "flex h-14.25 w-73.5 flex-col justify-between",
        wrapperClass
      )}
    >
      {(label || showValue) && (
        <div className={cn("flex justify-between", headerClass)}>
          {label && (
            <label className={cn("text-sm", titleClass)}>{label}</label>
          )}
          {showValue && (
            <span
              aria-live="polite"
              className={cn("text-sm", descriptionClass)}
            >
              {displayValue}
            </span>
          )}
        </div>
      )}

      <Slider
        ref={ref}
        className={cn("", sliderClass)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={label}
        value={value}
        onValueChange={handleSliderChange}
        {...props}
      />
    </div>
  );
};

export const RangeSlider = forwardRef(RangeSliderComp) as (
  props: RangeSliderProps & { ref?: Ref<HTMLSpanElement> }
) => ReturnType<typeof RangeSliderComp>;
