import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "./components/ui/button";
import { Form } from "./components/ui/form";
import FormBuilder, { FieldProps } from "./form/components/Field";
import NumberField from "./form/components/NumberField";
import SelectField from "./form/components/SelectFiled";

const formSchema = z.object({
  color: z.string().min(1, "Color is required"),
  textarea: z.string().min(1, "Textarea is required"),
  wind: z.string().min(1, "Wind is required"),
  price: z.string(),
  locations: z.string().min(1, "location is required"),
});

type formType = z.infer<typeof formSchema>;

function App() {
  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      color: "",
      textarea: "",
      wind: "",
      price: "",
      locations: "",
    },
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fields = useMemo((): FieldProps<formType>[] => {
    return [
      {
        type: "text",
        ref: inputRef,
        name: "color",
        label: "Color",
        placeholder: "Enter your color",
        autoFocus: true,
        autoComplete: "on",
        className: {
          inputClass: "",
        },
      },
      {
        type: "textarea",
        ref: textareaRef,
        name: "textarea",
        label: "Textarea",
        placeholder: "Enter your textarea",
        rows: 10,
        cols: 10,
        className: {
          textareaClass: "",
        },
      },
    ];
  }, []);
  // 2. Define a submit handler.
  function onSubmit(values: formType) {
    console.warn(values);
  }

  return (
    <div className="flex grow flex-col items-center justify-center gap-10">
      <p className="bg-blue-600 p-4 text-center text-5xl text-white">
        Vite Template
      </p>
      <div className="w-full max-w-md border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormBuilder fields={fields} />
            <NumberField<formType> ref={inputRef} name="price" label="Price" />
            <SelectField<formType>
              name="locations"
              className={{
                selectClass: "w-full",
              }}
              options={[
                {
                  label: "North America",
                  options: [
                    { label: "United States", value: "US" },
                    { label: "Canada", value: "CA" },
                  ],
                },
                { type: "separator" },
                {
                  label: "Europe",
                  options: [
                    { label: "Germany", value: "DE" },
                    { label: "France", value: "FR" },
                  ],
                },
                { type: "separator" },
                { label: "Other", value: "other" }, // Simple option mixed in
              ]}
              showScrollButtons={true}
            />

            <FormBuilder.Field
              type="search"
              name="wind"
              label="Wind"
              placeholder="Enter your wind"
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default App;
