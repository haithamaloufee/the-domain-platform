import { SectionHeader } from "@the-domain/ui";
import { MessageInbox } from "@/components/operations/message-inbox";
export default function Page() {
  return (
    <div className="grid max-w-5xl gap-8">
      <SectionHeader
        title="Contact messages"
        description="Enquiries submitted through the public website."
      />
      <MessageInbox />
    </div>
  );
}
