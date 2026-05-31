export type DropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
  title?: string;
};

export type DropdownProps = {
  options: DropdownOption[];
  value?: string | string[];
  onChange: (value: string | string[] | undefined) => void;
  multiple?: boolean;
  placeholder?: string;
  /** Shown when single-select value is empty (e.g. "All"). */
  emptyOption?: DropdownOption;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
};
