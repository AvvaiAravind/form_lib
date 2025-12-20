import {
  SelectOptionGroup,
  SelectOptionItem,
  SelectSeparatorOption,
  SelectSimpleOption,
} from "./select.types";

export const isSimpleOption = (
  item: SelectOptionItem
): item is SelectSimpleOption => {
  return "value" in item && "label" in item;
};

export const isOptionGroup = (
  item: SelectOptionItem
): item is SelectOptionGroup => {
  return "options" in item && Array.isArray(item.options);
};

export const isSeparator = (
  item: SelectOptionItem
): item is SelectSeparatorOption => {
  return "type" in item && item.type === "separator";
};
