import {
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from "@src/components/ui/select";
import { SelectOptionItem } from "../select.types";
import { isOptionGroup, isSeparator, isSimpleOption } from "../select.utils";

export const renderSelectOptions = (
  options: SelectOptionItem[],
  isLoading: boolean,
  loadingText: string,
  emptyText: string
) => {
  // Loading state
  if (isLoading) {
    return (
      <SelectItem value="" disabled>
        {loadingText}
      </SelectItem>
    );
  }

  // Empty state
  if (!options || options.length === 0) {
    return (
      <SelectItem value="" disabled>
        {emptyText}
      </SelectItem>
    );
  }

  return options.map((item, index) => {
    if (isSimpleOption(item)) {
      return (
        <SelectItem
          key={item._id || item.id || `${item.value}-${index}`}
          value={item.value}
        >
          {item.label}
        </SelectItem>
      );
    } else if (isOptionGroup(item)) {
      return (
        <SelectGroup key={`group-${item.label}`}>
          <SelectLabel>{item.label}</SelectLabel>
          {item.options.map((option) => (
            <SelectItem
              key={option.value}
              value={String(option.value)}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      );
    } else if (isSeparator(item)) {
      return <SelectSeparator key={`separator-${index}`} />;
    } else {
      return null;
    }
  });
};
