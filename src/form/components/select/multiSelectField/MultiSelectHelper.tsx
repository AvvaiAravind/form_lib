import {
  MultiSelectGroup,
  MultiSelectItem,
} from "@src/components/ui/multi-select";
import { SelectOptionItem } from "../select.types";
import { isOptionGroup, isSeparator, isSimpleOption } from "../select.utils";

export const renderMultiSelectOptions = (
  options: SelectOptionItem[],
  isLoading: boolean,
  loadingText: string,
  emptyText: string
) => {
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
};
