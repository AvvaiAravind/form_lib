import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { RangeSlider } from "./components/RangeSlider";
import { Button } from "./components/ui/button";
import { Form } from "./components/ui/form";
import { ChatTextArea } from "./form/components/ChatTextarea";
import FormBuilder, { FieldProps } from "./form/components/Field";
import NumberField from "./form/components/NumberField";
import PasswordField from "./form/components/PasswordField";

const formSchema = z.object({
  color: z.string().min(1, "Color is required"),
  textarea: z.string().min(1, "Textarea is required"),
  wind: z.email,
  price: z.string(),
  password: z.string(),
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
      password: "",
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
        type: "textarea", // need to implement character counter option in future
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
    <div className="flex min-h-screen flex-grow flex-col items-center justify-center gap-10 pb-20">
      <p className="bg-blue-600 p-4 text-center text-5xl text-white">
        Vite Template
      </p>
      <div className="w-full max-w-md border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormBuilder fields={fields} />
            <NumberField ref={inputRef} name="price" label="Price" />

            <FormBuilder.Field
              type="search"
              name="wind"
              label="Wind"
              placeholder="Enter your wind"
            />
            <PasswordField<formType>
              name={"password"}
              groupBtn={{
                isBtnNeed: false,
              }}
            />

            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
      <ChatTextArea variant="default" placeholder="Ask me anything..." />
      <RangeSlider
        mode="range"
        label="Product Range"
        formatValue={(value: number) => `$${value}`}
      />
    </div>
  );
}

export default App;
