import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@src/components/ui/input-group";
import { cn } from "@src/lib/utils";
import { ArrowUpIcon, Camera } from "lucide-react";
import {
  ButtonHTMLAttributes,
  forwardRef,
  KeyboardEvent,
  Ref,
  TextareaHTMLAttributes,
} from "react";

const variants = {
  default: {
    inputGroup: "max-w-107.25 rounded-sm w-full",
    inputTextArea: "h-24.5 p-4",
    inputGroupAddon: "",
    cameraBtn: "ml-auto",
    sendBtn: "",
    align: "block-end" as const,
  }, // Box style
  inline: {
    inputGroup: "rounded-full max-w-[663px] w-full",
    inputTextArea: "h-12 pl-4",
    inputGroupAddon: "",
    cameraBtn: "",
    sendBtn: "",
    align: "inline-end" as const,
  }, // Inline style
} as const;

type ChatTextCompType = {
  variant: "default" | "inline";
  placeholder: string;
  onCameraClick?: () => void;
  onSendClick?: () => void;
  onMessageChange?: (value: string) => void;
  value?: string;

  // Individual element props
  textareaProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
  cameraButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  sendButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
};

const ChatTextComp = (
  {
    variant,
    placeholder,
    onCameraClick,
    onSendClick,
    onMessageChange,
    value,
    textareaProps,
    cameraButtonProps,
    sendButtonProps,
  }: ChatTextCompType,
  ref?: Ref<HTMLTextAreaElement>
) => {
  const styles = variants[variant];

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendClick?.();
    }
  };

  return (
    <InputGroup className={cn("bg-white", styles.inputGroup)}>
      <InputGroupTextarea
        ref={ref}
        className={cn("min-h-0", styles.inputTextArea)}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onMessageChange?.(e.target.value)}
        name="chat-message"
        id={`chat-input-${variant}`}
        onKeyDown={(e) => handleKeyDown(e)}
        {...textareaProps}
      />
      <InputGroupAddon
        className={cn("", styles.inputGroupAddon)}
        align={styles.align}
      >
        <InputGroupButton
          type="button"
          variant="default"
          className={cn(
            "h-8 w-8 rounded-full hover:cursor-pointer",
            styles.cameraBtn
          )}
          size="icon-xs"
          onClick={onCameraClick}
          {...cameraButtonProps}
        >
          <Camera />
          <span className="sr-only">Camera</span>
        </InputGroupButton>
        <InputGroupButton
          variant="default"
          className={cn(
            "h-8 w-8 rounded-full hover:cursor-pointer",
            styles.sendBtn
          )}
          size="icon-xs"
          type="button"
          onClick={onSendClick}
          {...sendButtonProps}
        >
          <ArrowUpIcon />
          <span className="sr-only">Send</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

// Create the forwardRef component with proper typing
export const ChatTextArea = forwardRef(ChatTextComp) as (
  props: ChatTextCompType & { ref?: Ref<HTMLTextAreaElement> }
) => ReturnType<typeof ChatTextComp>;
