import { forwardRef, memo, ReactNode, Ref } from "react";
import { FieldPath, FieldValues } from "react-hook-form";
import InputField, { InputTypes } from "./InputField";
import NumberField from "./NumberField";
import TextareaField from "./Textarea";

type FieldTypes = "textarea" | InputTypes | "number-text";

export type FieldProps<T extends FieldValues = FieldValues> = {
  type: FieldTypes;
  name: FieldPath<T>;
  //allow any additional props
  [key: string]: any;
};

type ElementTypeMap = {
  textarea: HTMLTextAreaElement;
  text: HTMLInputElement;
  email: HTMLInputElement;
  password: HTMLInputElement;
  number: HTMLInputElement;
  tel: HTMLInputElement;
  url: HTMLInputElement;
  search: HTMLInputElement;
};

type FormBuilderProps<T extends FieldValues = FieldValues> = {
  fields?: FieldProps<T>[]; // config mode
  children?: ReactNode; // composition mode
};

const ALLOWED_TYPES = new Set([
  "text",
  "email",
  "password",
  "number",
  "tel",
  "url",
  "search",
]);

const Field = <T extends FieldValues = FieldValues>(
  props: FieldProps<T>,
  ref: Ref<ElementTypeMap[keyof ElementTypeMap]>
) => {
  const { type, name, ...restProps } = props;

  switch (type) {
    case "textarea":
      return (
        <TextareaField<T>
          ref={ref as Ref<HTMLTextAreaElement>}
          name={name}
          {...restProps}
        />
      );

    case "number-text":
      return (
        <NumberField<T>
          ref={ref as Ref<HTMLInputElement>}
          name={name}
          {...restProps}
        />
      );

    default:
      if (ALLOWED_TYPES.has(type)) {
        return (
          <InputField<T>
            ref={ref as Ref<HTMLInputElement>}
            type={type}
            name={name}
            {...restProps}
          />
        );
      }
      console.warn(`Unknown field type: ${type}`);
      return null;
  }
};

const FieldComp = forwardRef(Field as any) as <
  T extends FieldValues = FieldValues,
>(
  props: FieldProps<T> & { ref?: Ref<ElementTypeMap[keyof ElementTypeMap]> }
) => ReturnType<typeof Field>;

const FormBuilderBase = <T extends FieldValues = FieldValues>({
  fields,
  children,
}: FormBuilderProps<T>) => {
  if (fields && fields.length) {
    return fields.map((field) => <FieldComp key={field.name} {...field} />);
  }
  return <>{children}</>;
};

const FormBuilder = memo(FormBuilderBase) as any;

FormBuilder.Field = FieldComp;

export default FormBuilder;
