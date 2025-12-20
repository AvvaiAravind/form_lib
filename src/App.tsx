import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "./components/ui/button";
import { Form } from "./components/ui/form";
import {
  FieldProps,
  default as FormBuilderWithField,
} from "./form/components/Field";
import NumberField from "./form/components/NumberField";
import AsyncMultiSelectField from "./form/components/select/AsynMultiSelectField/AsyncMultiSelectField";
import { fetchMockComments } from "./form/components/select/AsynMultiSelectField/api";
import SelectField from "./form/components/select/SelectField/SelectField";
import MultiSelectField from "./form/components/select/multiSelectField/MultiSelectField";

const formSchema = z.object({
  color: z.string().min(1, "Color is required"),
  textarea: z.string().min(1, "Textarea is required"),
  wind: z.string().min(1, "Wind is required"),
  price: z.string(),
  location: z.string().min(1, "location is required"),
  // ✅ MultiSelect field - array of strings
  frameworks: z.array(z.string()).min(1, "Select at least one framework"),
  permissions: z.array(z.string()).min(2, "Select at least 2 permissions"),
  tags: z.array(z.string()).optional(),
  // ✅ Async multi-select (from API)
  assignedUsers: z.array(z.string()).min(1, "Select at least one user"),
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
      location: "",
      frameworks: [],
      permissions: [],
      tags: [],
      assignedUsers: [],
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

  // Define options for MultiSelect
  const frameworkOptions = [
    { label: "Next.js", value: "next.js", badgeLabel: "⚡" },
    { label: "SvelteKit", value: "sveltekit", badgeLabel: "🔥" },
    { label: "Nuxt.js", value: "nuxt.js", badgeLabel: "💚" },
    { label: "Remix", value: "remix", badgeLabel: "💿" },
    { label: "Astro", value: "astro", badgeLabel: "🚀" },
    { label: "Vue", value: "vue", badgeLabel: "💚" },
    { label: "React", value: "react", badgeLabel: "⚛️" },
  ];

  const permissionOptions = [
    {
      label: "Content Management",
      options: [
        { label: "Create Posts", value: "posts.create" },
        { label: "Edit Posts", value: "posts.edit" },
        { label: "Delete Posts", value: "posts.delete" },
        { label: "Publish Posts", value: "posts.publish" },
      ],
    },
    {
      label: "User Management",
      options: [
        { label: "Create Users", value: "users.create" },
        { label: "Edit Users", value: "users.edit" },
        { label: "Delete Users", value: "users.delete" },
        { label: "View Users", value: "users.view" },
      ],
    },
    {
      label: "Settings",
      options: [
        { label: "Manage Settings", value: "settings.manage" },
        { label: "View Analytics", value: "analytics.view" },
      ],
    },
  ];

  const tagOptions = [
    { label: "Work", value: "work" },
    { label: "Personal", value: "personal" },
    { label: "Urgent", value: "urgent" },
    { label: "Low Priority", value: "low-priority" },
    { label: "Bug", value: "bug" },
    { label: "Feature", value: "feature" },
  ];

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
            <FormBuilderWithField<formType> fields={fields} />
            <NumberField<formType> name="price" label="Price" />
            <SelectField<formType>
              label="Location"
              name="location"
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

            {/* MultiSelect - Basic with Custom Badges */}
            <MultiSelectField<formType>
              name="frameworks"
              label="Favorite Frameworks"
              placeholder="Select frameworks..."
              helperText="Choose your preferred frameworks"
              description="You can select multiple options"
              options={frameworkOptions}
              required
              clickToRemove={true}
              overflowBehavior="wrap-when-open"
            />

            {/* MultiSelect - Grouped Options with Search */}
            <MultiSelectField<formType>
              name="permissions"
              label="User Permissions"
              placeholder="Select permissions..."
              helperText="Select at least 2 permissions"
              description="These permissions will be assigned to the user"
              options={permissionOptions}
              required
              search={{
                placeholder: "Search permissions...",
                emptyMessage: "No permissions found",
              }}
            />

            {/* MultiSelect - Optional with Different Overflow */}
            <MultiSelectField<formType>
              name="tags"
              label="Tags (Optional)"
              placeholder="Select tags..."
              description="Add relevant tags to categorize this item"
              options={tagOptions}
              overflowBehavior="cutoff"
              clickToRemove={false}
            />

            {/* ✅ Async MultiSelect (from JSONPlaceholder API) */}
            <AsyncMultiSelectField<formType>
              name="assignedUsers"
              label="Assign Users (Async)"
              fetchOptions={fetchMockComments}
              queryKey={["mock-users"]}
              pageSize={10} // Load 3 users at a time
              searchEnabled={true}
              searchPlaceholder="Search by name, email..."
              searchDebounce={300}
              helperText="Type to search, scroll to load more"
              description="Users are loaded from JSONPlaceholder API"
              emptyMessage="No users found"
              required
              overflowBehavior="wrap-when-open"
              clickToRemove={true}
            />

            <FormBuilderWithField.Field<formType>
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
