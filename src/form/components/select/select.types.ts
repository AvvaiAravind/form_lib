// Enhanced option types
export interface SelectSimpleOption {
  _id?: string;
  id?: string;
  label: string;
  value: string;
  disabled?: boolean;
  badgeLabel?: string;
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
