import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "./components/ui/button";
import { Form } from "./components/ui/form";
import InputFieldComponent from "./form/InputField";

const formSchema = z.object({
  color: z.string(),
});

type formType = z.infer<typeof formSchema>;

function App() {
  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      color: "string",
    },
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  // 2. Define a submit handler.
  function onSubmit(values: formType) {
    console.warn(values);
  }

  return (
    <div className="flex flex-grow flex-col items-center justify-center gap-10">
      <p className="bg-blue-600 p-4 text-center text-5xl text-white">
        Vite Template
      </p>
      <div className="w-full max-w-md border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <InputFieldComponent
              ref={inputRef}
              className={{
                inputClass: "",
              }}
              type="search"
              control={form.control}
              label="Color"
              name="color"
              required
              disabled={false}
              autoFocus={true}
              autoComplete="on"
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default App;
