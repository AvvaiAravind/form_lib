import { mergeRefs } from "@src/form/utils/mergeRef";
import { cn } from "@src/lib/utils";
import { SearchIcon, X } from "lucide-react";
import { forwardRef, InputHTMLAttributes, Ref, useRef, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { Spinner } from "./ui/spinner";

type SearchCompProps = {
  placeholder?: string;
  isLoading?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  disabled?: boolean;
  defaultValue?: string;
  refocusOnClear?: boolean;
  className?: {
    inputClass?: string;
    buttonClass?: string;
    inputGroupClass?: string;
  };
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "disabled" | "placeholder" | "className" | "type"
>;

const Search = (
  {
    placeholder = "Search...",
    isLoading = false,
    value: controlledValue,
    defaultValue = "",
    onValueChange,
    className,
    disabled = false,
    onSubmit,
    refocusOnClear = true,
    ...props
  }: SearchCompProps,
  ref: Ref<HTMLInputElement>
) => {
  const { inputClass, buttonClass, inputGroupClass } = className || {};

  // use states
  const [internalValue, setInternalValue] = useState<string>(defaultValue);

  //use ref
  const internalRef = useRef<HTMLInputElement | null>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  const inputRef = mergeRefs(internalRef, ref);

  // event handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onSubmit && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(value);
    }
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue("");
    }
    onValueChange?.("");
    if (refocusOnClear && internalRef) {
      internalRef.current?.focus();
    }
  };

  return (
    <InputGroup data-disabled={disabled} className={cn(inputGroupClass, "")}>
      <InputGroupInput
        ref={inputRef}
        className={cn(inputClass, "")}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
      <InputGroupAddon>
        <SearchIcon aria-hidden />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        {isLoading && <Spinner />}
        {value && !isLoading && (
          <InputGroupButton
            variant={"ghost"}
            className={cn(buttonClass, "hover:cursor-pointer")}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X />
          </InputGroupButton>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
};

const SearchComp = forwardRef(Search) as (
  props: SearchCompProps & { ref?: Ref<HTMLInputElement> }
) => ReturnType<typeof Search>;

export default SearchComp;

// note use useImperativeHandle for ref related things need to do research
