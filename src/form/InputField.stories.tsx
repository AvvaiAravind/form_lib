import { zodResolver } from "@hookform/resolvers/zod";
import { Meta, StoryObj } from "@storybook/react-vite";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import InputField from "./InputField";

// Enhanced form schema with better validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  age: z.number().min(18, "Must be at least 18 years old"),
  phone: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional(),
});

type FormData = z.infer<typeof formSchema>;

const meta: Meta<typeof InputField> = {
  title: "Form/InputField",
  component: InputField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A type-safe, accessible input field component with react-hook-form integration.",
      },
    },
  },
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["text", "email", "number", "password", "tel", "url"],
      description: "Input type",
    },
    label: {
      control: { type: "text" },
      description: "Field label",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
    },
    description: {
      control: { type: "text" },
      description: "Helper text",
    },
    required: {
      control: { type: "boolean" },
      description: "Required field",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disabled state",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic stories with proper form context
export const Text: Story = {
  render: () => {
    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: { name: "" },
    });

    return (
      <FormProvider {...form}>
        <div className="w-full max-w-md space-y-4">
          <InputField
            control={form.control}
            type="text"
            name="name"
            label="Full Name"
            placeholder="Enter your full name"
            description="Please enter your legal name"
            required={true}
          />
        </div>
      </FormProvider>
    );
  },
};

export const Email: Story = {
  render: () => {
    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: { email: "" },
    });

    return (
      <FormProvider {...form}>
        <div className="w-full max-w-md space-y-4">
          <InputField
            control={form.control}
            type="email"
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            description="We'll use this for notifications"
            required={true}
          />
        </div>
      </FormProvider>
    );
  },
};

export const Password: Story = {
  render: () => {
    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: { password: "" },
    });

    return (
      <FormProvider {...form}>
        <div className="w-full max-w-md space-y-4">
          <InputField
            control={form.control}
            type="password"
            name="password"
            label="Password"
            placeholder="Create a strong password"
            description="Must be at least 8 characters"
            required={true}
          />
        </div>
      </FormProvider>
    );
  },
};

// Complete form example
export const CompleteForm: Story = {
  render: () => {
    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        email: "",
        password: "",
        age: 0,
        phone: "",
        website: "",
      },
    });

    const onSubmit = (data: FormData) => {
      console.warn("Form submitted:", data);
    };

    return (
      <FormProvider {...form}>
        <div className="w-full max-w-md space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              control={form.control}
              type="text"
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              required={true}
            />

            <InputField
              control={form.control}
              type="email"
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              required={true}
            />

            <InputField
              control={form.control}
              type="password"
              name="password"
              label="Password"
              placeholder="Create a strong password"
              required={true}
            />

            <InputField
              control={form.control}
              type="number"
              name="age"
              label="Age"
              placeholder="Enter your age"
              required={true}
              min={18}
            />

            <InputField
              control={form.control}
              type="tel"
              name="phone"
              label="Phone Number"
              placeholder="Enter your phone number"
              description="Optional"
            />

            <InputField
              control={form.control}
              type="url"
              name="website"
              label="Website"
              placeholder="https://example.com"
              description="Optional"
            />

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Submitting..." : "Submit Form"}
            </button>
          </form>
        </div>
      </FormProvider>
    );
  },
};

// Error state example
export const WithError: Story = {
  render: () => {
    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: { email: "invalid-email" },
      mode: "onChange",
    });

    // Trigger validation
    form.trigger("email");

    return (
      <FormProvider {...form}>
        <div className="w-full max-w-md space-y-4">
          <InputField
            control={form.control}
            type="email"
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            description="This field has a validation error"
            required={true}
          />
        </div>
      </FormProvider>
    );
  },
};
